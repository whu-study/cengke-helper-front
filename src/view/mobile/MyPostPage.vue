<template>
    <el-container class="my-posts-page-container">
      <el-main class="my-posts-main-content">
        <div class="action-bar">
          <h1 class="page-title">我发布的帖子</h1>
          <el-button
            type="primary"
            round
            size="large"
            @click="navigateToCreatePost"
            class="create-post-button"
          >
            <el-icon style="margin-right: 8px;"><EditPen /></el-icon>
            发布新帖
          </el-button>
        </div>
  
        <PostList
          :posts="postsStore.posts"
          :loading="postsStore.isLoading"
          :show-controls="false" 
          :show-pagination="true"
          :total="postsStore.pagination.totalPosts"
          :current-page="currentApiParams.page || 1"
          :page-size="currentApiParams.limit || 9"
          :author-id="currentUserId?.toString()" :current-sort-by="currentApiParams.sortBy"
          :current-filter-text="currentApiParams.filterText || ''"
          page-title="" show-create-button @page-change="handlePageParamsChange"
          @filter-change="handleFilterSortChange" />
      </el-main>
    </el-container>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import PostList from '@/components/PostList.vue'; // 确保路径正确
  import { useRouter } from 'vue-router';
  import { EditPen } from '@element-plus/icons-vue';
  import { usePostsStore } from '@/store/modules/postsStore'; // 确保路径正确
  import { useUserStore } from '@/store/modules/userStore'; // 或你的 user store
  import type { GetPostsParams } from '@/api/postService'; // 导入参数类型
  import { ElMessage } from 'element-plus';
  
  const postsStore = usePostsStore();
  const userStore = useUserStore(); // 获取用户 store 实例
  const router = useRouter();
  
  // 获取当前登录用户的 ID
  const currentUserId = computed(() => {
    // 根据你的 userStore 实现来获取用户 ID
    // 假设 userStore.currentUser.id 或 userStore.userInfo.id
    return  userStore.userInfo?.id?.toString() || null;
  });
  
  // 父组件维护一个用于API请求的参数对象
  const currentApiParams = ref<GetPostsParams>({
    page: 1, // 默认为第一页
    limit: 9,  // 默认每页数量
    sortBy: 'createdAt_desc', // 默认排序（可以按需调整，例如“我的帖子”默认显示最新的）
    filterText: '', // 文本筛选通常不在“我的帖子”页面使用，但保留以保持 PostList 的接口一致性
    authorId: undefined, // 这个会在 fetchData 中根据 currentUserId 设置
  });
  
  /**
   * 导航到创建新帖子的页面
   */
  const navigateToCreatePost = () => {
    router.push({ name: 'CreatePost' }); // 假设路由名称为 CreatePost
  };
  
  /**
   * 统一的数据获取函数
   */
  const fetchData = () => {
    if (!currentUserId.value) {
      ElMessage.warning('请先登录以查看您的帖子。');
      // 清空帖子列表，或重定向到登录页
      postsStore.clearCurrentPost(); // 假设 postsStore 有清空帖子的方法
      // router.push({ name: 'Login' }); // 如果未登录则跳转
      return;
    }
  
    // 确保将当前用户的 ID 设置到 API 请求参数中
    const paramsToFetch: GetPostsParams = {
      ...currentApiParams.value,
      authorId: currentUserId.value, // 覆盖 authorId
    };
  
    postsStore.fetchPosts(paramsToFetch)
      .catch(error => {
        console.error('Failed to fetch user posts in MyPostPage:', error);
        ElMessage.error(`加载您的帖子失败: ${error.message || '未知错误'}`);
      });
  };
  
  /**
   * 处理 PostList 组件触发的页码或每页数量变化事件
   */
  const handlePageParamsChange = (payload: { page: number; limit: number }) => {
    currentApiParams.value.page = payload.page;
    currentApiParams.value.limit = payload.limit;
    fetchData(); // 使用更新后的参数重新获取数据
  };
  
  /**
   * 处理 PostList 组件触发的筛选或排序条件变化事件
   * 对于“我的帖子”页面，filterText 通常不使用，sortBy 可能有有限选项或固定。
   */
  const handleFilterSortChange = (filters: { sortBy?: string; filterText?: string; authorId?: string | number | null }) => {
    if (filters.sortBy !== undefined) {
      currentApiParams.value.sortBy = filters.sortBy;
    }
    // MyPostPage 通常不从 PostList 接收 filterText，因为控件是隐藏的
    // 如果将来需要，可以取消注释下面这行
    // if (filters.filterText !== undefined) {
    //   currentApiParams.value.filterText = filters.filterText;
    // }
  
    currentApiParams.value.page = 1; // 筛选或排序变化时，总是重置到第一页
    fetchData(); // 使用更新后的参数重新获取数据
  };
  
  // --- 生命周期钩子 ---
  onMounted(() => {
    // 组件挂载后，如果用户已登录，则获取其帖子数据
    // 如果 currentUserId 是 computed，它会在 userStore 初始化后更新
    // 如果 store 可能是异步加载的，确保 currentUserId 有值后再 fetchData
    if (currentUserId.value) {
      fetchData();
    } else {
      // 可以在这里监听 userStore.currentUser 的变化，一旦有 ID 就 fetchData
      // 或者依赖 ProfilePage 等上一级页面确保用户已登录并有ID
      // 如果直接访问此页面但用户未登录，路由守卫应处理重定向
      // 若 store 异步初始化，可能需要 watch currentUserId
    }
  });
  
  // 监听 currentUserId 的变化 (例如，用户登出后又重新登录了另一个账号)
  watch(currentUserId, (newId, oldId) => {
    if (newId && newId !== oldId) {
      currentApiParams.value.page = 1; // 重置页码
      fetchData();
    } else if (!newId && oldId) {
      // 用户登出，清空帖子
      postsStore.clearCurrentPost(); // 假设 postsStore 有清空帖子的方法
    }
  });
  
  // 可选：如果希望 postsStore 中的分页状态变化也能反向更新 currentApiParams
  // 这通常在 store 的分页状态可能被其他地方修改时有用
  watch(() => postsStore.pagination.currentPage, (newPage) => {
    if (currentApiParams.value.page !== newPage ) { // 仅当有控件时才双向同步
      currentApiParams.value.page = newPage;
    }
  });
  watch(() => postsStore.pagination.pageSize, (newSize) => {
    if (currentApiParams.value.limit !== newSize ) {
      currentApiParams.value.limit = newSize;
    }
  });
  
  </script>
  
  <style scoped>
  /* 样式可以很大程度上复用 DiscussPage.txt 的样式，进行微调 */
  .my-posts-page-container {
    min-height: 100vh;
    background-color: #f0f2f5; /* 与 DiscussPage 背景色一致 */
  }
  
  .my-posts-main-content {
    padding: clamp(16px, 4vw, 24px); /* 响应式内边距 */
    max-width: 1200px; /* 可以设置一个最大宽度 */
    margin: 0 auto; /* 居中 */
    overflow-x: hidden;
  }
  
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: clamp(16px, 3vw, 24px);
    padding: clamp(12px, 2vw, 20px) clamp(8px, 1vw, 12px);
    background-color: #ffffff;
    border-radius: clamp(8px, 1.5vw, 12px);
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.06);
  }
  
  .page-title {
    font-size: clamp(20px, 2.5vw, 28px); /* 响应式字体大小 */
    color: #303133;
    margin: 0;
    font-weight: 600;
  }
  
  .create-post-button {
    font-size: clamp(14px, 1.5vw, 16px);
    padding: clamp(8px, 1.2vw, 12px) clamp(16px, 2vw, 20px);
    height: auto;
  }
  
  .create-post-button .el-icon {
    font-size: clamp(16px, 1.8vw, 20px);
  }
  
  /* 确保 PostList 组件有足够的空间 */
  :deep(.post-list-container) {
    background-color: transparent; /* MyPostPage 已有背景色，PostList 背景可透明 */
    padding: 0; /* 移除 PostList 自身的 padding，由 MyPostPage 控制 */
    border-radius: 0;
  }
  
  @media (min-width: 768px) {
    .my-posts-main-content {
      padding: 24px;
    }
    .action-bar {
      margin-bottom: 24px;
      padding: 16px 20px;
    }
    .page-title {
      font-size: 24px;
    }
    .create-post-button {
      font-size: 14px;
    }
    .create-post-button .el-icon {
      font-size: 16px;
    }
  }
  </style>