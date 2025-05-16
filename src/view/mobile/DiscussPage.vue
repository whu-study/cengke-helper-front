<template>
  <el-container class="home-view-container">
    <el-main class="home-main-content">
      <div class="create-post-action-bar">
        <h1 class="page-title">社区动态</h1>
        <el-button type="primary" round size="large" @click="navigateToCreatePost" class="create-post-button">
          <el-icon style="margin-right: 0.5vw;"><EditPen /></el-icon>
          发布新帖
        </el-button>
      </div>

      <PostList
        :posts="postsStore.posts"
        :loading="postsStore.isLoading"
        :show-controls="true"
        :show-pagination="true"
        :total="postsStore.pagination.totalPosts"
        :current-page="currentApiParams.page||1"
        :page-size="currentApiParams.limit||9"
        :current-sort-by="currentApiParams.sortBy"
        :current-filter-text="currentApiParams.filterText" 
        @page-change="(page: number, limit: number) => handlePageParamsChange({page, limit})"
        @filter-change="handleFilterSortChange"
      />
      </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import PostList from '@/components/PostList.vue'; // 确保路径正确
import { useRouter } from 'vue-router';
import { EditPen } from '@element-plus/icons-vue';
import { usePostsStore } from '@/store/modules/postsStore'; // 确保路径正确
import type { GetPostsParams } from '@/api/postService'; // 导入参数类型
import { ElMessage } from 'element-plus';

const postsStore = usePostsStore();
const router = useRouter();

// 父组件维护一个用于API请求的参数对象
// 这个对象将作为 PostList 的初始状态，并用于调用 fetchPosts
const currentApiParams = ref<GetPostsParams>({
  page: postsStore.pagination.currentPage, // 从 store 初始化
  limit: postsStore.pagination.pageSize,  // 从 store 初始化
  sortBy: 'createdAt_desc', // 默认排序
  filterText: '',
  category: undefined, // 如果有分类筛选，也在这里管理
  tag: undefined,      // 如果有标签筛选
  authorId: undefined, // 如果有作者筛选
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
  postsStore.fetchPosts(currentApiParams.value)
    .catch(error => {
      console.error('Failed to fetch posts in DiscussPage:', error);
      ElMessage.error(`加载帖子失败: ${error.message || '未知错误'}`);
    });
};

/**
 * 处理 PostList 组件触发的页码或每页数量变化事件
 * @param page 新的页码
 * @param limit 新的每页数量
 */
const handlePageParamsChange = (payload: { page: number; limit: number }) => {
  currentApiParams.value.page = payload.page;
  currentApiParams.value.limit = payload.limit;
  fetchData(); // 使用更新后的参数重新获取数据
};

/**
 * 处理 PostList 组件触发的筛选或排序条件变化事件
 * @param filters 包含 sortBy 和/或 filterText 的对象
 */
const handleFilterSortChange = (filters: { sortBy?: string; filterText?: string }) => {
  if (filters.sortBy !== undefined) {
    currentApiParams.value.sortBy = filters.sortBy;
  }
  if (filters.filterText !== undefined) {
    currentApiParams.value.filterText = filters.filterText;
  }
  currentApiParams.value.page = 1; // 筛选或排序变化时，总是重置到第一页
  fetchData(); // 使用更新后的参数重新获取数据
};

// --- 生命周期钩子 ---
onMounted(() => {
  // 初始化时，可以根据需要同步一次 store 的分页状态到 currentApiParams
  // 或者直接使用 currentApiParams 的初始值（其中 page 和 limit 已从 store 初始化）
  currentApiParams.value.page = postsStore.pagination.currentPage;
  currentApiParams.value.limit = postsStore.pagination.pageSize;
  // 可以添加更多初始筛选参数，例如从 URL query 获取
  // currentApiParams.value.category = route.query.category || undefined;

  fetchData(); // 组件挂载后，调用 fetchData 获取初始帖子数据
});

// 可选：如果希望 store 中的分页状态变化也能反向更新 currentApiParams
// 这通常在 store 的分页状态可能被其他地方修改时有用
watch(() => postsStore.pagination.currentPage, (newPage) => {
  if (currentApiParams.value.page !== newPage) {
    currentApiParams.value.page = newPage;
    // 通常不在这里自动 fetchData，避免循环更新，除非有特定逻辑
  }
});
watch(() => postsStore.pagination.pageSize, (newSize) => {
  if (currentApiParams.value.limit !== newSize) {
    currentApiParams.value.limit = newSize;
    // 通常不在这里自动 fetchData
  }
});

</script>

<style scoped>
/* 样式与之前的 DiscussPage.txt 保持一致 */
.home-view-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.home-main-content {
  padding: 4vw;
  max-width: 100%;
  overflow-x: hidden;
}

.create-post-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4vw;
  padding: 2vw 1vw;
  background-color: #ffffff;
  border-radius: 2vw;
  box-shadow: 0 0.5vw 1.5vw rgba(0, 0, 0, 0.06);
}

.page-title {
  font-size: 5.5vw;
  color: #303133;
  margin: 0;
  font-weight: 600;
}

.create-post-button {
  font-size: 3.8vw;
  padding: 2.5vw 5vw;
  height: auto;
}

.create-post-button .el-icon {
  font-size: 4vw;
}

@media (min-width: 768px) {
  .home-main-content { padding: 3vw; }
  .create-post-action-bar { margin-bottom: 3vw; padding: 1.5vw 2vw; }
  .page-title { font-size: 2.5vw; }
  .create-post-button { font-size: 1.5vw; padding: 1vw 2vw; }
  .create-post-button .el-icon { font-size: 1.6vw; }
}
</style>