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
import PostForm from '@/components/PostForm.vue'; // 引入新的表单组件
import { ElMessage, ElNotification, ElPageHeader, ElContainer, ElHeader, ElMain } from 'element-plus';
import { apiCreatePost, type CreatePostBody } from '@/api/postService'; // 导入创建API和类型
import { usePostsStore } from '@/store/modules/postsStore'; // 如果需要更新 store
import { successCode } from '@/api/myAxios';
import type { Post } from '@/types/discuss';
import type { FormSubmitPayload } from '@/components/PostForm.vue';
const router = useRouter();
const postsStore = usePostsStore(); // 可选，如果创建成功后要更新 store
const isSubmitting = ref(false);
const postFormComponentRef = ref<InstanceType<typeof PostForm> | null>(null);


  const handleCreatePost = (payload: FormSubmitPayload) => { // 接收更宽泛的 FormSubmitPayload
  // 在创建场景下，我们期望 payload 满足 CreatePostBody 的要求
  // 表单验证应该已经确保了 title 和 content 是存在的
  // 如果 TypeScript 仍然报错，可以进行类型断言，但要确保逻辑上是安全的
  const createData = payload as CreatePostBody;

  // 或者进行运行时检查和类型守卫（更安全）
  if (!(typeof createData.title === 'string' && typeof createData.content === 'string')) {
      ElMessage.error('表单数据不完整，无法创建帖子。');
      isSubmitting.value = false; // 如果之前设置为true了
      return;
  }

  isSubmitting.value = true;
  apiCreatePost(createData) // 现在 createData 是 CreatePostBody 类型
    .then(response => {
      if (response.code === successCode && response.data) {
        ElNotification({
          title: '发布成功！',
          message: `帖子 "${response.data.title}" 已成功发布。`,
          type: 'success',
          duration: 3000,
        });
        postFormComponentRef.value?.resetFormFields();
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