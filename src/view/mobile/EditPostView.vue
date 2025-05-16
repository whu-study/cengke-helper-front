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
        <template #default>
          <el-button type="primary" plain @click="goBackOrHome" round size="small">返回</el-button>
        </template>
      </el-alert>

      <PostForm
        v-else-if="postToEdit"
        :is-edit-mode="true"
        :editing-post="postToEdit"
        :is-submitting="isSubmitting"
        @submit-form="handleUpdatePost"
        @cancel-edit="handleEditCancelled"
        ref="postFormComponentRef"
      />
      <el-empty v-else description="没有找到要编辑的帖子数据。" />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PostForm from '@/components/PostForm.vue'; // 引入新的表单组件
import type { Post } from '@/types/discuss';
import { ElMessage, ElNotification, ElSkeleton, ElAlert, ElEmpty, ElPageHeader, ElContainer, ElHeader, ElMain } from 'element-plus';
import { apiGetPostById, apiUpdatePost, type UpdatePostBody } from '@/api/postService'; // 导入获取和更新API
import { useUserStore } from '@/store/modules/userStore'; // 或你的 user store
import { usePostsStore } from '@/store/modules/postsStore'; // 如果需要更新 store
import { successCode } from '@/api/myAxios';

const postToEdit = ref<Post | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isSubmitting = ref(false);
const postFormComponentRef = ref<InstanceType<typeof PostForm> | null>(null);

const route = useRoute();
const router = useRouter();
const userStore = useUserStore(); // 用于权限检查
const postsStore = usePostsStore(); // 可选

const fetchPostForEditing = async (postId: string | number) => {
  isLoading.value = true;
  error.value = null;
  postToEdit.value = null;

  try {
    const response = await apiGetPostById(postId);
    if (response.code === successCode && response.data) {
      // 权限检查：确保当前用户是帖子的作者
      if (response.data.author?.id?.toString() !== userStore.userInfo?.id?.toString()) {
        error.value = "您没有权限编辑此帖子。";
        ElMessage.error("权限验证失败：您不是该帖子的作者。");
        // 可以选择导航离开，例如回到帖子详情或首页
        // router.replace({ name: 'PostDetail', params: { id: postId } });
        return; // 阻止进一步加载表单
      }
      postToEdit.value = response.data;
    } else {
      error.value = response.msg || "无法加载帖子数据进行编辑。帖子可能不存在。";
      ElMessage.error(error.value);
    }
  } catch (err: any) {
    console.error("获取帖子数据失败:", err);
    error.value = "获取帖子数据时发生网络错误，请稍后再试。";
    ElMessage.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

const handleUpdatePost = (payload: UpdatePostBody) => {
  if (!postToEdit.value || !postToEdit.value.id) {
    ElMessage.error("无法确定要更新的帖子。");
    return;
  }
  isSubmitting.value = true;
  apiUpdatePost(postToEdit.value.id, payload)
    .then(response => {
      if (response.code === successCode && response.data) {
        ElNotification({
          title: '更新成功！',
          message: `帖子 "${response.data.title}" 已成功更新。`,
          type: 'success',
          duration: 3000,
        });
        // 可选: 更新 postsStore 中的帖子
        // postsStore.updatePostInList(response.data); // 假设 store 有此方法
        router.push({ name: 'PostDetail', params: { id: response.data.id.toString() } });
      } else {
        ElMessage.error(response.msg || '帖子更新失败，请稍后再试。');
      }
    })
    .catch(err => {
      console.error("更新帖子失败:", err);
      ElMessage.error('帖子更新请求失败，请检查网络或联系管理员。');
    })
    .finally(() => {
      isSubmitting.value = false;
    });
};

const handleEditCancelled = () => {
  ElMessage.info('编辑已取消');
  if (postToEdit.value) {
    router.push({ name: 'PostDetail', params: { id: postToEdit.value.id.toString() } });
  } else {
    goBack();
  }
};

const goBack = () => {
  if (window.history.length > 1 && router.options.history.state.back) {
    router.back();
  } else if (postToEdit.value?.id) {
    router.replace({ name: 'PostDetail', params: { id: postToEdit.value.id.toString() }});
  } else {
    router.replace({ name: 'DiscussHome' }); // 默认返回社区首页
  }
};
const goBackOrHome = () => {
  // 错误状态下的返回逻辑
  if (route.params.id) {
     router.replace({ name: 'PostDetail', params: { id: route.params.id as string }});
  } else {
    router.replace({ name: 'DiscussHome' });
  }
}


onMounted(() => {
  const postIdFromRoute = route.params.id;
  if (postIdFromRoute && typeof postIdFromRoute === 'string') {
    fetchPostForEditing(postIdFromRoute);
  } else {
    error.value = "无效的帖子ID，无法进行编辑。";
    isLoading.value = false;
    ElMessage.error("编辑错误：缺少有效的帖子ID！");
    // router.replace({ name: 'DiscussHome' }); // 或者跳转到404页面
  }
});
</script>

<style scoped>
/* 样式与 PublishPage.vue 类似，可以复用或微调 */
.edit-post-view-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.page-header-container {
  background-color: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  height: auto;
  display: flex;
  align-items: center;
}
.page-header-custom {
  width: 100%;
}
.page-header-custom :deep(.el-page-header__content) {
  font-size: clamp(18px, 2vw, 20px);
  color: var(--el-text-color-primary);
  font-weight: 600;
}
.page-header-custom :deep(.el-page-header__icon),
.page-header-custom :deep(.el-page-header__left .el-divider--vertical) {
  font-size: clamp(20px, 2.2vw, 22px);
  margin-right: 12px;
}

.main-content {
  padding: clamp(16px, 3vw, 24px);
}

.loading-state, .error-alert, .el-empty {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  text-align: center;
  margin: 0 auto;
  max-width: 800px; /* 与 PostForm 宽度协调 */
}
.error-alert .el-button {
  margin-top: 10px;
}
:deep(.post-form-wrapper) {
  margin-top: 0;
}
</style>