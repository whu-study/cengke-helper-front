<template>
  <el-container class="edit-post-view-container">
    <el-header class="page-header-container">
      <el-page-header @back="goBack" class="page-header-custom">
        <template #content>
          <span class="header-title">编辑帖子</span>
        </template>
      </el-page-header>
    </el-header>

    <el-main class="main-content">
      <div v-if="isLoading" class="loading-state">
        <el-skeleton :rows="8" animated />
        <el-skeleton :rows="3" animated style="margin-top: 20px;" />
      </div>

      <el-alert
          v-else-if="error"
          :title="error"
          type="error"
          show-icon
          :closable="false"
          class="error-alert"
      >
        <el-button type="primary" plain @click="goBack" round size="small">返回上一页</el-button>
      </el-alert>

      <CreatePostForm
          v-else-if="postToEdit"
          :is-edit-mode="true"
          :editing-post="postToEdit"
          @post-updated="handlePostUpdated"
          @edit-cancelled="handleEditCancelled"
          ref="editFormRef"
      />
      <el-empty v-else description="无法加载帖子数据进行编辑" />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CreatePostForm from '@/components/CreatePostForm.vue'; // 引入表单组件
import type { Post } from '@/types/discuss'; // 引入 Post 类型
import { ElMessage, ElNotification, ElSkeleton, ElAlert, ElEmpty } from 'element-plus';

// --- 响应式状态 ---
const postToEdit = ref<Post | null>(null); // 要编辑的帖子数据
const isLoading = ref(true); // 加载状态
const error = ref<string | null>(null); // 错误信息
const editFormRef = ref<InstanceType<typeof CreatePostForm> | null>(null); // 表单组件的引用

// --- 路由与导航 ---
const route = useRoute(); // 获取当前路由信息
const router = useRouter(); // 获取路由实例

// --- 模拟当前登录用户信息 (在实际应用中，这应该从 Pinia Store 或认证服务获取) ---
const currentUser = ref<{ id: string | number }>({ id: 'user1' }); // 假设当前用户ID

// --- 方法 ---

/**
 * 根据路由参数中的帖子 ID 获取帖子详情以供编辑
 * @param postId 帖子ID
 */
const fetchPostForEditing = async (postId: string | number) => {
  isLoading.value = true;
  error.value = null;
  postToEdit.value = null;

  console.log(`正在获取 ID 为 ${postId} 的帖子数据以供编辑...`);

  // --- 模拟 API 请求延迟 ---
  await new Promise(resolve => setTimeout(resolve, 800));

  // --- 在实际应用中，这里应该调用你的 postService 来获取帖子数据 ---
  // 例如:
  // try {
  //   const fetchedPost = await postService.getPostById(postId);
  //   // 检查当前用户是否有权编辑此帖
  //   if (fetchedPost.author.id !== currentUser.value?.id) {
  //     error.value = "您没有权限编辑此帖子。";
  //     ElMessage.error("权限不足！");
  //     router.replace({ name: 'PostDetail', params: { id: postId } }); // 或跳转到其他页面
  //     return;
  //   }
  //   postToEdit.value = fetchedPost;
  // } catch (err) {
  //   console.error("获取帖子数据失败:", err);
  //   error.value = "无法加载帖子数据，请稍后再试。";
  // } finally {
  //   isLoading.value = false;
  // }

  // --- 以下为模拟数据 ---
  const sampleUser1 = { id: 'user1', username: '探索者约翰', avatar: '...' };
  const mockPostsDatabase: Post[] = [
    { id: '1', title: '初探 Vue 3 Composition API', content: '这是 Vue 3 Composition API 的一些内容...', author: sampleUser1, createdAt: new Date(), tags: ['Vue3', 'Frontend'], likesCount: 10, commentsCount: 2 },
    { id: '2', title: 'Element Plus 主题定制技巧', content: 'Element Plus 主题定制非常灵活...', author: {id: 'user2', username: '设计师小王', avatar: '...'}, createdAt: new Date(), tags: ['UI', 'ElementPlus'], likesCount: 5, commentsCount: 1 },
  ];

  const foundPost = mockPostsDatabase.find(p => p.id.toString() === postId.toString());

  if (foundPost) {
    // 模拟权限检查
    if (foundPost.author.id !== currentUser.value?.id) {
      error.value = "您没有权限编辑此帖子。";
      ElMessage.error("权限不足！您不是该帖子的作者。");
      isLoading.value = false;
      // 可以选择导航离开
      // setTimeout(() => router.replace({ name: 'PostDetail', params: { id: postId } }), 2000);
      return;
    }
    postToEdit.value = foundPost;
  } else {
    error.value = "未找到要编辑的帖子。它可能已被删除或链接无效。";
  }
  isLoading.value = false;
};

/**
 * 处理帖子成功更新事件
 * @param updatedPost - 更新后的帖子数据
 */
const handlePostUpdated = (updatedPost: { id: string | number; title: string }) => {
  // ElNotification 已在表单组件内部处理
  // ElMessage.success(`帖子 "${updatedPost.title}" 更新成功！`);
  // 更新成功后，通常导航回帖子详情页
  router.push({ name: 'PostDetail', params: { id: updatedPost.id } });
};

/**
 * 处理取消编辑事件
 */
const handleEditCancelled = () => {
  // 用户取消编辑，导航回帖子详情页或上一页
  if (postToEdit.value) {
    router.push({ name: 'PostDetail', params: { id: postToEdit.value.id } });
  } else {
    goBack(); // 如果没有帖子数据，则尝试返回上一页
  }
};

/**
 * 返回上一页或指定页面
 */
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    // 如果没有历史记录 (例如直接打开编辑页)，则导航到帖子详情页 (如果可能) 或论坛首页
    const postId = route.params.id;
    if (postId) {
      router.replace({ name: 'PostDetail', params: { id: postId }});
    } else {
      router.replace({ name: 'DiscussHome' });
    }
  }
};

// --- 生命周期钩子 ---
onMounted(() => {
  const postIdFromRoute = route.params.id;
  if (postIdFromRoute) {
    fetchPostForEditing(postIdFromRoute as string);
  } else {
    error.value = "无效的帖子ID，无法进行编辑。";
    isLoading.value = false;
    ElMessage.error("缺少帖子ID！");
    // router.replace({ name: 'DiscussHome' }); // 或跳转到404
  }
});
</script>

<style scoped>
.edit-post-view-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.page-header-container {
  background-color: #fff;
  padding: 2vw 4vw;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 0.3vw 0.8vw rgba(0, 0, 0, 0.04);
  height: auto;
  display: flex;
  align-items: center;
}
.page-header-custom {
  width: 100%;
}
.page-header-custom :deep(.el-page-header__content) {
  font-size: 4.5vw;
  color: #303133;
  font-weight: 600;
}
.page-header-custom :deep(.el-page-header__icon),
.page-header-custom :deep(.el-page-header__left .el-divider--vertical) {
  font-size: 5vw;
  margin-right: 2vw;
}

.main-content {
  padding: 4vw;
}

.loading-state {
  padding: 5vw;
  background-color: #fff;
  border-radius: 2vw;
}

.error-alert {
  margin: 2vw auto;
  max-width: 90%;
  font-size: 3.8vw;
  padding: 3vw;
}
.error-alert .el-button {
  margin-top: 2vw;
  font-size: 3.5vw;
  padding: 1.5vw 3vw;
}


@media (min-width: 768px) {
  .page-header-container {
    padding: 1.5vw 3vw;
  }
  .page-header-custom :deep(.el-page-header__content) {
    font-size: 1.8vw;
  }
  .page-header-custom :deep(.el-page-header__icon) {
    font-size: 2vw;
  }
  .main-content {
    padding: 3vw;
  }
  .error-alert {
    font-size: 1.3vw;
  }
  .error-alert .el-button {
    font-size: 1.2vw;
  }
}
</style>
