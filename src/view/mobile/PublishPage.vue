<template>
  <el-container class="publish-page-container">
    <el-header class="page-header-container">
      <el-page-header @back="goBack" class="page-header-custom">
        <template #content>
          <span class="header-title">发布新帖子</span>
        </template>
      </el-page-header>
    </el-header>

    <el-main class="main-content">
      <PostForm
        :is-edit-mode="false"
        :is-submitting="isSubmitting"
        @submit-form="handleCreatePost"
        ref="postFormComponentRef"
      />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// 引入新的表单组件
import { ElMessage, ElNotification, ElPageHeader, ElContainer, ElHeader, ElMain } from 'element-plus';
import { apiCreatePost, type CreatePostBody } from '@/api/postService'; // 导入创建API和类型
import { usePostsStore } from '@/store/modules/postsStore'; // 如果需要更新 store
import { successCode } from '@/api/myAxios';
import type { Post } from '@/types/discuss';
import PostForm from '@/components/post/CreatePostForm.vue'; 
import type { FormSubmitPayload } from '@/components/post/CreatePostForm.vue';
const router = useRouter();
const postsStore = usePostsStore(); // 可选，如果创建成功后要更新 store
const isSubmitting = ref(false);
const postFormComponentRef = ref<InstanceType<typeof PostForm> | null>(null);


const handleCreatePost = (payload: FormSubmitPayload) => {
  console.log("payload",payload)
  // 类型转换，确保所有必填字段有值
  if (!payload.title || !payload.content || !payload.tags) {
    ElMessage.error('请填写完整的标题、内容和分类');
    return;
  }
  const createPayload: CreatePostBody = {
    title: payload.title,
    content: payload.content,
    category: payload.category,
    tags: payload.tags || [],
    // 其他字段按需补充
  };
  isSubmitting.value = true;
  apiCreatePost(createPayload)
    .then(response => {
      if (response.code === successCode && response.data) {
        ElNotification({
          title: '发布成功！',
          message: `帖子 "${response.data.title}" 已成功发布。`,
          type: 'success',
          duration: 3000,
        });
        // 可选: 更新 postsStore
        // postsStore.addPost(response.data); // 假设 store 有此方法
        // postsStore.fetchPosts(); // 或者简单粗暴地刷新列表

        // 发布成功后重置表单
        postFormComponentRef.value?.resetFormFields();

        // 导航到新帖子的详情页
        router.push({ name: 'PostDetail', params: { id: response.data.id.toString() } });
      } else {
        ElMessage.error(response.msg || '帖子发布失败，请稍后再试。');
      }
    })
    .catch(error => {
      console.error("创建帖子失败:", error);
      ElMessage.error('帖子发布请求失败，请检查网络或联系管理员。');
    })
    .finally(() => {
      isSubmitting.value = false;
    });
};

const goBack = () => {
  // 考虑是否有未保存的更改
  // if (postFormComponentRef.value?.hasChanges()) { // 假设 PostForm 内部有 hasChanges 逻辑
  //   ElMessageBox.confirm('您有未保存的更改，确定要离开吗？', '提示', { /* ... */ });
  // } else {
  //   router.back();
  // }
  router.back(); // 简单返回
};

</script>

<style scoped>
.publish-page-container {
  min-height: 100vh;
  background-color: #f0f2f5; /* 页面背景色 */
}

.page-header-container {
  background-color: #fff;
  padding: 16px 24px; /* 调整内边距 */
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  height: auto; /* 自适应高度 */
  display: flex;
  align-items: center;
}

.page-header-custom {
  width: 100%;
}

.page-header-custom :deep(.el-page-header__content) {
  font-size: clamp(18px, 2vw, 20px); /* 响应式标题字体 */
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.page-header-custom :deep(.el-page-header__icon),
.page-header-custom :deep(.el-page-header__left .el-divider--vertical) {
  font-size: clamp(20px, 2.2vw, 22px); /* 响应式图标大小 */
  margin-right: 12px;
}

.main-content {
  padding: clamp(16px, 3vw, 24px);
  /* PostForm.vue 已经有 max-width 和自己的 padding/margin，这里主要提供页面级padding */
}

/* 确保 PostForm 组件的容器不会有冲突的样式 */
:deep(.post-form-wrapper) {
  margin-top: 0; /* 如果 PostForm 有 margin-top，在这里覆盖 */
}
</style>