// src/views/PostDetailView.vue
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
        :title="postError"
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

        <div class="post-body-content" v-html="post.content"></div>

        <div class="post-tags-detail" v-if="post.tags && post.tags.length > 0">
          <el-tag
            v-for="tag in post.tags"
            :key="tag"
            type="info"
            effect="plain"
            round
            style="margin-right: 0.8vw; margin-top: 1vw;"
          >
            {{ tag }}
          </el-tag>
        </div>

        <div class="actions-interaction-bar">
          <LikeButton
            v-if="post"
            :item-id="post.id"
            :initial-likes="post.likesCount || 0"
            :is-initially-liked="post.isLikedByCurrentUser || false"
            item-type="post"
            size="small"
            @like-toggled="handleInteractionToggled('like', $event)"
          />
          <CollectButton
            v-if="post"
            :item-id="post.id"
            :initial-collects="post.collectCount || 0"
            :is-initially-collected="post.isCollectedByCurrentUser || false"
            item-type="post"
            size="small"
            @collect-toggled="handleInteractionToggled('collect', $event)"
          />
          <span class="stats-separator">·</span>
          <span class="view-count-detail">
            <el-icon><ViewIcon /></el-icon> {{ post.viewCount || 0 }} 次浏览
          </span>
        </div>
      </el-card>

      <div v-if="post && post.id" class="comments-section">
        <h2 class="comments-title">评论区 ({{ post.commentsCount || 0 }})</h2>
        <CommentList
          :post-id="post.id"
          @comment-posted="handleCommentPosted"
          :current-user-id="userStore.currentUser?.id"
        />
      </div>
    </el-main>

    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="80vw"
      :max-width="'400px'"
      center
      append-to-body
      class="delete-confirm-dialog"
    >
      <span>确定要删除这篇帖子吗？此操作不可撤销。</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false" round>取消</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowRight, Edit, Delete, View as ViewIcon } from '@element-plus/icons-vue';
import CommentList from '@/components/CommentList.vue';
import LikeButton from '@/components/LikeButton.vue';
import CollectButton from '@/components/CollectButton.vue'; // ★ 导入 CollectButton

import { usePostsStore } from '@/store/modules/postsStore';
import { useUserStore } from '@/store/modules/userStore';
import { storeToRefs } from 'pinia';

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
  if (!post.value || !userStore.currentUser) return false;
  return post.value.author?.id?.toString() === userStore.currentUser.id?.toString();
});

const loadPostDetail = (postId: string | number) => {
  postsStore.fetchPostById(postId).catch(err => {
    console.error("Error caught in component while fetching post detail:", err);
  });
};

const editPost = () => {
  if (!post.value) return;
  router.push({ name: 'EditPost', params: { id: post.value.id.toString() } });
};

const confirmDeletePost = () => {
  deleteDialogVisible.value = true;
};

const executeDeletePost = async () => {
  if (!post.value) return;
  isDeleting.value = true;
  try {
    const success = await postsStore.deletePost(post.value.id);
    if (success) {
      ElMessage.success(`帖子 "${post.value?.title || ''}" 已被删除`);
      router.replace({ name: 'DiscussHome' });
    }
  } catch (err) {
     // Error message should be handled by the store action
  } finally {
    deleteDialogVisible.value = false;
    isDeleting.value = false;
  }
};

const handleCommentPosted = () => {
  if (post.value && post.value.id) {
    if (typeof post.value.commentsCount === 'number') {
        post.value.commentsCount++;
    } else {
        post.value.commentsCount = 1;
    }
  }
};

// ★ 通用交互处理函数
const handleInteractionToggled = (
    type: 'like' | 'collect',
    payload: { itemId: string | number; isLiked?: boolean; newLikesCount?: number; isCollected?: boolean; newCollectsCount?: number }
) => {
  console.log(`${type} status changed in PostDetailView:`, payload);
  // 帖子数据 (post.value) 应该会因为 store action 的执行而自动更新其内部的
  // isLikedByCurrentUser, likesCount, isFavoritedByCurrentUser, collectCount 字段
  // 所以这里通常不需要手动更新 post.value 的这些字段，除非 store action 没有完全更新它们
  // 例如，如果你的 store action 更新了 currentPost.value，而 post 是 currentPost.value 的一个 ref，
  // 那么视图会自动更新。
};


onMounted(() => {
  const postIdFromRoute = route.params.id;
  if (postIdFromRoute) {
    loadPostDetail(postIdFromRoute as string);
  } else {
    ElMessage.error("无效的帖子链接。");
    router.replace({ name: 'DiscussHome' });
  }
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadPostDetail(newId as string);
  } else if (!newId && oldId) {
    postsStore.currentPost = null;
  }
});
</script>

</script>

<style scoped>
/* 样式与之前的 PostDetailView.txt 保持一致或按需调整 */
.post-detail-view-container {
  background-color: #f0f2f5;
  min-height: 100vh;
  padding-bottom: 5vw;
}

.post-detail-main {
  padding: 3vw;
  max-width: 900px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 2vw;
  box-shadow: 0 0.5vw 2vw rgba(0, 0, 0, 0.08);
}

.breadcrumb-nav {
  margin-bottom: 3vw;
  font-size: 3.5vw;
}
.breadcrumb-nav .el-breadcrumb__item {
  font-size: 3.5vw;
}
.breadcrumb-nav .el-breadcrumb__inner,
.breadcrumb-nav .el-breadcrumb__separator {
  color: #606266;
}
.breadcrumb-nav .el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: #303133;
  font-weight: 600;
}

.loading-state { padding: 5vw 0; }
.error-alert { margin-bottom: 3vw; font-size: 3.8vw; }
.post-content-card { border: none; box-shadow: none !important; }
.post-header { padding-bottom: 2vw; }
.post-title { font-size: 6vw; color: #1f2d3d; margin: 0 0 2.5vw 0; line-height: 1.3; font-weight: 700; }
.author-meta-info { display: flex; align-items: center; margin-bottom: 3vw; position: relative; }
.author-avatar { margin-right: 2vw; flex-shrink: 0; }
.author-details { display: flex; flex-direction: column; }
.author-name { font-size: 3.8vw; font-weight: 600; color: #303133; margin-bottom: 0.5vw; }
.publish-date { font-size: 3.2vw; color: #909399; }
.post-actions { margin-left: auto; display: flex; gap: 2vw; }
.post-actions .el-button { width: 8vw; height: 8vw; font-size: 4vw; }
.post-body-content { font-size: 4vw; line-height: 1.7; color: #333; word-wrap: break-word; padding: 2vw 0; }
.post-body-content :deep(p) { margin-bottom: 2.5vw; }
.post-body-content :deep(h2) { font-size: 5vw; margin: 4vw 0 2vw; padding-bottom: 1vw; border-bottom: 1px solid #eee; }
.post-body-content :deep(h3) { font-size: 4.5vw; margin: 3vw 0 1.5vw; }
.post-body-content :deep(ul),
.post-body-content :deep(ol) { padding-left: 5vw; margin-bottom: 2.5vw; }
.post-body-content :deep(li) { margin-bottom: 1vw; }
.post-body-content :deep(pre) { background-color: #f7f7f7; padding: 2.5vw; border-radius: 1vw; overflow-x: auto; margin-bottom: 2.5vw; font-size: 3.5vw; }
.post-body-content :deep(code) { font-family: 'Courier New', Courier, monospace; background-color: #f0f0f0; padding: 0.3vw 0.8vw; border-radius: 0.5vw; font-size: 0.9em; }
.post-body-content :deep(pre code) { background-color: transparent; padding: 0; border-radius: 0; font-size: 1em; }
.post-body-content :deep(blockquote) { margin: 2.5vw 0; padding: 2vw 3vw; border-left: 1vw solid #409EFF; background-color: #f9fafb; color: #606266; }
.post-body-content :deep(img) { max-width: 100%; height: auto; border-radius: 1vw; margin: 2vw 0; }
.post-tags-detail { margin-top: 4vw; padding-top: 3vw; border-top: 1px dashed #dcdfe6; }
.like-button-container { margin-top: 4vw; padding-top: 3vw; border-top: 1px solid #e8e8e8; display: flex; align-items: center; gap: 2vw; }
.stats-separator { color: #ccc; font-size: 3.5vw; }
.view-count-detail { font-size: 3.5vw; color: #909399; display: inline-flex; align-items: center; }
.view-count-detail .el-icon { margin-right: 0.8vw; }
.comments-section { margin-top: 6vw; padding-top: 4vw; border-top: 1px solid #dcdfe6; }
.comments-title { font-size: 5vw; color: #303133; margin-bottom: 3vw; font-weight: 600; }
.delete-confirm-dialog .dialog-footer { display: flex; justify-content: space-around; }
.delete-confirm-dialog .el-button { width: 30vw; font-size: 3.8vw; padding: 2.5vw 0; height: auto; }

@media (min-width: 768px) {
  .post-detail-main { padding: 2.5vw; border-radius: 1vw; }
  .breadcrumb-nav, .breadcrumb-nav .el-breadcrumb__item { font-size: 1.2vw; }
  .error-alert { font-size: 1.3vw; }
  .post-title { font-size: 2.8vw; }
  .author-name { font-size: 1.3vw; }
  .publish-date { font-size: 1.1vw; }
  .post-actions .el-button { width: 3vw; height: 3vw; font-size: 1.5vw; }
  .post-body-content { font-size: 1.4vw; }
  .post-body-content :deep(h2) { font-size: 2vw; }
  .post-body-content :deep(h3) { font-size: 1.7vw; }
  .post-body-content :deep(pre) { font-size: 1.2vw; }
  .like-button-container, .view-count-detail, .stats-separator { font-size: 1.2vw; }
  .comments-title { font-size: 2vw; }
  .delete-confirm-dialog { width: 30vw !important; }
  .delete-confirm-dialog .el-button { width: 10vw; font-size: 1.2vw; }
}
</style>