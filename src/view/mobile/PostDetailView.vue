<template>
  <el-container class="post-detail-view-container">
    <el-main class="post-detail-main">
      <el-breadcrumb separator-icon="ArrowRight" class="breadcrumb-nav">
        <el-breadcrumb-item :to="{ name: 'DiscussHome' }">社区首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="post && post.category" :to="{ name: 'CategoryView', params: { category: post.category } }">
          {{ post.category }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>帖子详情</el-breadcrumb-item>
      </el-breadcrumb>

      <div v-if="isLoadingPost" class="loading-state">
        <el-skeleton :rows="10" animated />
      </div>

      <el-alert
        v-else-if="postError"
        :title="postError || '加载帖子失败'"
        type="error"
        show-icon
        :closable="false"
        class="error-alert"
      />

      <el-card v-else-if="post" class="post-content-card" shadow="never">
        <template #header>
          <div class="post-header">
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="author-meta-info">
              <el-avatar :size="32" :src="post.author?.avatar || defaultAvatar" class="author-avatar">
                {{ post.author?.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <div class="author-details">
                <span class="author-name">{{ post.author?.username || '匿名用户' }}</span>
                <span class="publish-date">发布于 {{ formattedPublishTime }}</span>
              </div>
              <div class="post-actions" v-if="isAuthor">
                <el-button type="primary" :icon="Edit" circle @click="editPost" title="编辑帖子" />
                <el-button type="danger" :icon="Delete" circle @click="confirmDeletePost" title="删除帖子" />
              </div>
            </div>
          </div>
        </template>

        <div class="post-body-content" v-html="processedContent"></div> <div class="post-tags-detail" v-if="post.tags && post.tags.length > 0">
          <el-tag
            v-for="tag in post.tags"
            :key="tag"
            type="info"
            effect="plain"
            round
            style="margin-right: 8px; margin-top: 10px;"
          >
            {{ tag }}
          </el-tag>
        </div>

        // PostDetailView.vue - template section for LikeButton
        <div class="interaction-section">
          <LikeButton
            v-if="post && userStore.userInfo.id" :item-id="post.id"
            :initial-likes="post.likesCount || 0"
            :is-initially-liked="!!post.isLikedByCurrentUser"
            item-type="post"
            :post-id="post.id" @like-toggled="handlePostLikeToggled"
          />
          <span class="stats-separator" v-if="post && userStore.userInfo.id">·</span>

          <CollectButton
            v-if="post && userStore.userInfo.id" :item-id="post.id"
            :initial-collects="post.collectCount || 0"
            :is-initially-collected="!!post.isCollectedByCurrentUser"
            item-type="post"
            @collect-toggled="handlePostCollectToggled"
          />
          <span class="stats-separator" v-if="post && userStore.userInfo.id">·</span>
          <span class="view-count-detail">
            <el-icon><ViewIcon /></el-icon> {{ post.viewCount || 0 }} 次浏览
          </span>
        </div>
      </el-card>

      <div v-if="post && post.id" class="comments-section">
        <h2 class="comments-title">评论区 ({{ post.commentsCount || 0 }})</h2>
        <CommentList
    :post-id="post.id"
    @comment-action-complete="handleCommentActionComplete" />
      </div>
    </el-main>

    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="clamp(300px, 80vw, 400px)"
      center
      append-to-body
      class="delete-confirm-dialog"
      :close-on-click-modal="false"
    >
      <span>确定要删除这篇帖子 “<strong>{{ post?.title }}</strong>” 吗？此操作不可撤销。</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false" round :disabled="isDeleting">取消</el-button>
          <el-button type="danger" @click="executeDeletePost" round :loading="isDeleting">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Post } from '@/types/discuss';
import { ElMessage, ElMessageBox, ElNotification, ElDialog } from 'element-plus';
import { ArrowRight, Edit, Delete, View as ViewIcon } from '@element-plus/icons-vue';
import CommentList from '@/components/comment/CommentList.vue'; // 假设路径正确
import LikeButton from '@/components/LikeButton.vue';   // 假设路径正确

// --- 引入 Store 和 Service ---
import { usePostsStore } from '@/store/modules/postsStore'; // 假设你有一个帖子 store
import { useUserStore } from '@/store/modules/userStore'; // 你的用户 store
import { apiDeletePost } from '@/api/postService'; // 导入删除 API
import { successCode } from '@/api/myAxios';     // 导入成功码常量

import { storeToRefs } from 'pinia';
import DOMPurify from 'dompurify'; // 用于XSS防护

const postsStore = usePostsStore();
const userStore = useUserStore();
const { currentPost: post, isLoading: isLoadingPost, error: postError } = storeToRefs(postsStore);

const deleteDialogVisible = ref(false);
const isDeleting = ref(false);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

const route = useRoute();
const router = useRouter();

const formattedPublishTime = computed(() => {
  if (!post.value || !post.value.createdAt) return '未知时间';
  const date = new Date(post.value.createdAt);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
});

const isAuthor = computed(() => {
  if (!post.value || !post.value.author || !userStore.userInfo || !userStore.userInfo.id) {
    return false;
  }
  return post.value.author.id?.toString() === userStore.userInfo.id.toString();
});

// 对 v-html 绑定的内容进行XSS清理
const processedContent = computed(() => {
  if (post.value && post.value.content) {
    return DOMPurify.sanitize(post.value.content);
  }
  return '';
});

 async function loadPostDetail(postId: string | number) {
   await postsStore.fetchPostById(postId).catch(err => {
    
    console.error("Error caught in component while fetching post detail:", err);
    // ElMessage.error(postsStore.error || '加载帖子详情失败'); // postError 已在模板中处理
  });
  // console.log("post.value",post.value)
};

const editPost = () => {
  if (!post.value) return;
  router.push({ name: 'EditPost', params: { id: post.value.id.toString() } });
};

const confirmDeletePost = () => {
  if (!isAuthor.value) {
    ElMessage.error('您没有权限删除此帖子。');
    return;
  }
  deleteDialogVisible.value = true;
};
// PostDetailView.vue - script section
// ...
// 移除 handleLikeUpdate 和 handleCountUpdate 方法，因为 LikeButton 和 postsStore 会处理
// const handleLikeUpdate = (newLikeState: boolean, type: 'like' | 'collect') => { ... };
// const handleCountUpdate = (newCount: number, type: 'like' | 'collect') => { ... };

const handleCommentActionComplete = () => {
  if (post.value && post.value.id) {
    // 当 CommentList 内部有评论增删改查操作完成时，
    // 最可靠的方式是重新从后端获取最新的帖子信息（包含最新的评论数）
    // 或者，如果你的后端 API 在评论操作后返回了新的帖子评论总数，可以利用它。
    // commentsStore.addComment/deleteComment 之后会刷新评论列表，但不一定会更新帖子的 commentsCount
    
    // 方案1: 强制刷新帖子详情 (会获取最新的 commentsCount)
    postsStore.fetchPostById(post.value.id).then(() => {
        console.log('Post details refreshed after comment action, new comment count:', post.value?.commentsCount);
    }).catch(err => {
        console.error("Failed to refresh post details after comment action:", err);
    });

    // 方案2: (不太推荐，因为 commentsCount 的权威来源是帖子本身，而不是前端累加)
    // 假设你知道是增加了一个评论 (这比较难判断是新增还是删除回复等)
    // if (post.value && typeof post.value.commentsCount === 'number') {
    //   post.value.commentsCount++;
    // } else if (post.value) {
    //   post.value.commentsCount = (post.value.commentsCount || 0) + 1; // 更安全一点
    // }
    // ElMessage 提示应该由 CommentList 或其内部逻辑处理，这里不再重复
  }
};
const handlePostLikeToggled = (payload: { itemId: string | number; itemType: 'post' | 'comment'; isLiked: boolean; newLikesCount: number; success: boolean }) => {
  if (payload.itemType === 'post') {
    
    if (payload.success) {
      console.log(`Post ${payload.itemId} like status successfully toggled. Store should reflect changes.`);
      // 关键：不要在这里手动修改 post.value.isLikedByCurrentUser 或 post.value.likesCount
      // postsStore.toggleLikePost action 负责更新 store,
      // 而 const { currentPost: post, ... } = storeToRefs(postsStore); 会确保 post.value 自动更新。
      // 如果 store 没有正确更新，需要检查 postsStore.toggleLikePost 的实现。
    } else {
      console.warn(`Post ${payload.itemId} like toggle failed in LikeButton. UI should have reverted.`);
      // LikeButton 内部应该处理了乐观更新的回滚
    }
  }
};

// 新增：处理 CollectButton 的事件
const handlePostCollectToggled = (payload: { itemId: string | number; itemType: 'post'; isCollected: boolean; newCollectsCount: number }) => {
  // CollectButton.vue 应该也已经调用了 postsStore.toggleCollectPost
  // store 更新后，post.value.isCollectedByCurrentUser 和 post.value.collectCount 会自动更新
  if (payload.itemType === 'post') { // 实际上 CollectButton 内部已经判断了 itemType
    console.log(`Post ${payload.itemId} collect status successfully toggled. Store should reflect changes.`);
    // 同样，不要在这里手动修改 post.value.isCollectedByCurrentUser 或 post.value.collectCount
  }
};
// ...
const executeDeletePost = () => {
  if (!post.value || !isAuthor.value) return;

  isDeleting.value = true;
  apiDeletePost(post.value.id)
    .then(response => {
      if (response.code === successCode) { // 假设 successCode = 0
        ElMessage.success('帖子已成功删除！');
        // 可选：从 postsStore 中移除该帖子，或触发列表刷新
        // postsStore.removePostFromList(post.value.id);
        router.push({ name: 'DiscussHome' }); // 或用户的帖子列表页 'MyPosts'
      } else {
        ElMessage.error(response.msg || '删除帖子失败，请稍后再试。');
      }
    })
    .catch(error => {
      console.error('删除帖子API请求失败:', error);
      ElMessage.error('删除帖子请求失败，请检查网络或联系管理员。');
    })
    .finally(() => {
      isDeleting.value = false;
      deleteDialogVisible.value = false;
    });
};

const handleCommentPosted = () => {
  if (post.value) {
    // 假设评论发布后，后端会更新帖子的 commentsCount
    // 重新获取帖子详情是最可靠的方式，或者如果API返回了新的count，则手动更新
    // postsStore.fetchPostById(post.value.id);
    if (typeof post.value.commentsCount === 'number') {
        post.value.commentsCount++;
    } else {
        post.value.commentsCount = 1;
    }
     ElMessage.success('评论已发布！');
  }
};

// LikeButton 现在会通过事件更新父组件状态
const handleLikeUpdate = (newLikeState: boolean, type: 'like' | 'collect') => {
  if (post.value && type === 'like') {
    post.value.isLikedByCurrentUser = newLikeState;
  }
  // 如果有收藏，类似处理
};
const handleCountUpdate = (newCount: number, type: 'like' | 'collect') => {
   if (post.value && type === 'like') {
    post.value.likesCount = newCount;
  }
  // 如果有收藏，类似处理
};


onMounted(() => {
  const postIdFromRoute = route.params.id;
  if (postIdFromRoute) {


    loadPostDetail(postIdFromRoute as string);
    // console.log("post.value",post.value)
  } else {
    ElMessage.error("无效的帖子链接。");
    router.replace({ name: 'DiscussHome' });
  }
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadPostDetail(newId as string);
  } else if (!newId && oldId) {
    // postsStore.clearCurrentPost();
  }
}, { immediate: true }); // immediate: true 确保首次加载也执行


// 如果 store 中没有 fetchPostById, 而是在这里直接调用 API
// onMounted(async () => {
//   const postId = route.params.id as string;
//   if (postId) {
//     isLoadingPost.value = true; // 需要本地的 loading 状态
//     try {
//       const response = await apiGetPostById(postId);
//       if (response.code === successCode && response.data) {
//         post.value = response.data; // 需要本地的 post ref
//       } else {
//         postError.value = response.msg || '加载帖子失败';
//       }
//     } catch (err) {
//       postError.value = '网络错误，加载帖子失败';
//     } finally {
//       isLoadingPost.value = false;
//     }
//   } else { /* ... */ }
// });
</script>

<style scoped>
/* 样式基本保持与 PostDetailView.txt (source: 37-64, 148-175)一致，可以进行微调 */
.post-detail-view-container {
  background-color: var(--el-bg-color-page, #f0f2f5);
  min-height: 100vh;
  padding-bottom: 20px;
}

.post-detail-main {
  padding: clamp(16px, 3vw, 24px);
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--el-bg-color-overlay, #ffffff);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.breadcrumb-nav {
  margin-bottom: 20px;
  font-size: 14px;
}
/* ... (可以从 PostDetailView.txt 复制大部分样式) ... */

.post-header { padding-bottom: 15px; }
.post-title {
  font-size: clamp(24px, 4vw, 32px);
  color: var(--el-text-color-primary);
  margin: 0 0 15px 0;
  line-height: 1.3;
  font-weight: 700;
}
.author-meta-info { display: flex; align-items: center; margin-bottom: 20px; position: relative; }
.author-avatar { margin-right: 12px; flex-shrink: 0; }
.author-details { display: flex; flex-direction: column; }
.author-name { font-size: 15px; font-weight: 600; color: var(--el-text-color-primary); margin-bottom: 2px; }
.publish-date { font-size: 13px; color: var(--el-text-color-secondary); }

.post-actions {
  margin-left: auto; /* 将按钮推到右侧 */
  display: flex;
  gap: 10px;
}
.post-actions .el-button {
  /* 根据需要调整按钮大小 */
}

.post-body-content {
  font-size: 16px;
  line-height: 1.75;
  color: var(--el-text-color-regular);
  word-wrap: break-word;
  padding: 10px 0;
}
.post-body-content :deep(p) { margin-bottom: 1em; }
.post-body-content :deep(h1), .post-body-content :deep(h2), .post-body-content :deep(h3) { margin: 1.5em 0 0.8em; line-height: 1.4; }
.post-body-content :deep(img) { max-width: 100%; height: auto; border-radius: 6px; margin: 10px 0; }
/* 更多针对 v-html 内容的样式 */

.post-tags-detail {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

.interaction-section {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.stats-separator { color: var(--el-border-color); }
.view-count-detail { display: inline-flex; align-items: center; }
.view-count-detail .el-icon { margin-right: 4px; }

.comments-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color);
}
.comments-title {
  font-size: 20px;
  color: var(--el-text-color-primary);
  margin-bottom: 15px;
  font-weight: 600;
}

.delete-confirm-dialog .dialog-footer {
  display: flex;
  justify-content: flex-end; /* Element Plus 默认的对话框页脚按钮对齐方式 */
  gap: 10px;
}
.delete-confirm-dialog .el-button {
  /* 调整按钮大小和字体 */
}

.loading-state, .error-alert {
  padding: 20px;
  text-align: center;
}
</style>