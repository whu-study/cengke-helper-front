<template>
  <div class="pc-discuss-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">社区讨论</h1>
          <p class="page-subtitle">分享知识，交流学习心得</p>
        </div>
        <div class="header-right">
          <el-button
            type="primary"
            size="large"
            :icon="EditPen"
            @click="navigateToCreatePost"
            class="create-post-btn"
          >
            发布新帖
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧内容 - 帖子列表 -->
      <div class="content-main">
        <!-- 筛选和排序工具栏 -->
        <el-card class="filter-toolbar" shadow="never">
          <div class="toolbar-content">
            <!-- 搜索框 -->
            <div class="search-section">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索帖子标题或内容..."
                :prefix-icon="Search"
                clearable
                @keyup.enter="handleSearch"
                @clear="handleSearchClear"
                class="search-input"
              />
              <el-button type="primary" :icon="Search" @click="handleSearch">
                搜索
              </el-button>
            </div>

            <!-- 筛选选项 -->
            <div class="filter-section">
              <el-select
                v-model="currentSortBy"
                placeholder="排序方式"
                @change="handleSortChange"
                style="width: 140px"
              >
                <el-option label="最新发布" value="createdAt_desc" />
                <el-option label="最早发布" value="createdAt_asc" />
                <el-option label="最多点赞" value="likesCount_desc" />
                <el-option label="最多评论" value="commentsCount_desc" />
                <el-option label="最多浏览" value="viewCount_desc" />
              </el-select>

              <el-select
                v-model="selectedCategory"
                placeholder="分类筛选"
                @change="handleCategoryChange"
                clearable
                style="width: 120px"
              >
                <el-option label="全部" value="" />
                <el-option label="学习讨论" value="study" />
                <el-option label="课程评价" value="review" />
                <el-option label="资源分享" value="resource" />
                <el-option label="问题求助" value="help" />
                <el-option label="其他" value="other" />
              </el-select>

              <el-button :icon="Refresh" @click="handleReset" circle />
            </div>
          </div>

          <!-- 热门标签 -->
          <div class="hot-tags-section" v-if="hotTags.length > 0">
            <span class="tags-label">热门标签:</span>
            <el-tag
              v-for="tag in hotTags"
              :key="tag"
              @click="handleTagClick(tag)"
              class="hot-tag"
              :type="selectedTag === tag ? 'primary' : ''"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-card>

        <!-- 帖子列表 -->
        <el-card class="posts-container" shadow="never">
          <PostList
            :posts="postsStore.posts"
            :loading="postsStore.isLoading"
            :show-controls="false"
            :show-pagination="true"
            :total="postsStore.pagination.totalPosts"
            :current-page="currentApiParams.page || 1"
            :page-size="currentApiParams.limit || 10"
            :current-sort-by="currentApiParams.sortBy"
            :current-filter-text="currentApiParams.filterText"
            @page-change="(page: number, limit: number) => handlePageParamsChange({page, limit})"
            @filter-change="handleFilterSortChange"
            class="pc-post-list"
          />
        </el-card>
      </div>

      <!-- 右侧边栏 -->
      <div class="content-sidebar">
        <!-- 快速操作 -->
        <el-card class="quick-actions-card" shadow="hover">
          <template #header>
            <h3>快速操作</h3>
          </template>
          <div class="quick-actions">
            <el-button
              v-if="userStore.ifLogin"
              type="primary"
              :icon="EditPen"
              @click="navigateToCreatePost"
              block
            >
              发布新帖
            </el-button>
            <el-button
              v-else
              type="primary"
              :icon="EditPen"
              @click="goToLogin"
              block
            >
              登录后发帖
            </el-button>
            <el-button :icon="House" @click="goToHome" block plain>
              返回首页
            </el-button>
            <el-button 
              v-if="userStore.ifLogin"
              :icon="Document" 
              @click="goToMyPosts" 
              block 
              plain
            >
              我的帖子
            </el-button>
          </div>
        </el-card>

        <!-- 热门帖子 -->
        <el-card class="hot-posts-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>热门讨论</h3>
              <el-tag size="small" type="danger">Hot</el-tag>
            </div>
          </template>
          <div v-if="hotPostsLoading" class="loading-wrapper">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="hotPosts.length > 0" class="hot-posts-list">
            <div
              v-for="(post, index) in hotPosts"
              :key="post.id"
              class="hot-post-item"
              @click="goToPostDetail(Number(post.id))"
            >
              <div class="post-rank">{{ index + 1 }}</div>
              <div class="post-info">
                <h4 class="post-title">{{ post.title }}</h4>
                <div class="post-meta">
                  <span class="post-stats">
                    <el-icon><View /></el-icon> {{ post.viewCount || 0 }}
                  </span>
                  <span class="post-stats">
                    <el-icon><ChatDotSquare /></el-icon> {{ post.commentsCount || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-hot-posts">
            <el-empty description="暂无热门帖子" :image-size="60" />
          </div>
        </el-card>

        <!-- 统计信息 -->
        <el-card class="stats-card" shadow="hover">
          <template #header>
            <h3>社区数据</h3>
          </template>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ postsStore.pagination.totalPosts || 0 }}</div>
                <div class="stat-label">总帖子</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ onlineUsers }}</div>
                <div class="stat-label">在线用户</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ todayPosts }}</div>
                <div class="stat-label">今日新帖</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 最新用户 -->
        <el-card class="recent-users-card" shadow="hover">
          <template #header>
            <h3>活跃用户</h3>
          </template>
          <div class="recent-users-list">
            <div
              v-for="user in recentUsers"
              :key="user.id"
              class="user-item"
            >
              <el-avatar :size="32" :src="user.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-info">
                <div class="username">{{ user.username }}</div>
                <div class="user-role">{{ user.role }}</div>
              </div>
              <div class="user-status online"></div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePostsStore } from '@/store/modules/postsStore';
import { useUserStore } from '@/store/modules/userStore';
import type { GetPostsParams } from '@/api/postService';
import type { Post } from '@/types/discuss';
import PostList from '@/components/post/PostList.vue';
import {
  EditPen,
  Search,
  Refresh,
  House,
  Document,
  User,
  View,
  ChatDotSquare,
  Calendar
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const postsStore = usePostsStore();
const userStore = useUserStore();

// 响应式状态
const searchKeyword = ref('');
const currentSortBy = ref('createdAt_desc');
const selectedCategory = ref('');
const selectedTag = ref('');
const hotPosts = ref<Post[]>([]);
const hotPostsLoading = ref(false);

// API 参数
const currentApiParams = ref<GetPostsParams>({
  page: postsStore.pagination.currentPage,
  limit: 10,
  sortBy: 'createdAt_desc',
  filterText: '',
  category: undefined,
  tag: undefined,
  authorId: undefined,
});

// 模拟数据
const hotTags = ref(['JavaScript', 'Vue.js', '数据结构', '算法', '前端开发', '后端开发']);
const onlineUsers = ref(128);
const todayPosts = ref(15);
const recentUsers = ref([
  { id: 1, username: '学习小能手', role: '活跃用户', avatar: '' },
  { id: 2, username: '代码达人', role: '版主', avatar: '' },
  { id: 3, username: '知识分享者', role: '普通用户', avatar: '' },
  { id: 4, username: '技术探索者', role: '活跃用户', avatar: '' },
]);

// 方法
const navigateToCreatePost = () => {
  if (!userStore.ifLogin) {
    ElMessage.warning('请先登录后再发帖！');
    router.push('/profile');
    return;
  }
  router.push({ name: 'CreatePost' });
};

const goToHome = () => {
  router.push('/home');
};

const goToLogin = () => {
  router.push('/profile');
};

const goToMyPosts = () => {
  if (userStore.userInfo?.id) {
    router.push(`/user/${userStore.userInfo.id}/posts`);
  }
};

const goToPostDetail = (postId: number) => {
  router.push(`/post/${postId}`);
};

const handleSearch = () => {
  currentApiParams.value.filterText = searchKeyword.value;
  currentApiParams.value.page = 1;
  fetchData();
};

const handleSearchClear = () => {
  searchKeyword.value = '';
  currentApiParams.value.filterText = '';
  currentApiParams.value.page = 1;
  fetchData();
};

const handleSortChange = (sortBy: string) => {
  currentApiParams.value.sortBy = sortBy;
  currentApiParams.value.page = 1;
  fetchData();
};

const handleCategoryChange = (category: string) => {
  currentApiParams.value.category = category || undefined;
  currentApiParams.value.page = 1;
  fetchData();
};

const handleTagClick = (tag: string) => {
  if (selectedTag.value === tag) {
    selectedTag.value = '';
    currentApiParams.value.tag = undefined;
  } else {
    selectedTag.value = tag;
    currentApiParams.value.tag = tag;
  }
  currentApiParams.value.page = 1;
  fetchData();
};

const handleReset = () => {
  searchKeyword.value = '';
  currentSortBy.value = 'createdAt_desc';
  selectedCategory.value = '';
  selectedTag.value = '';
  currentApiParams.value = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt_desc',
    filterText: '',
    category: undefined,
    tag: undefined,
    authorId: undefined,
  };
  fetchData();
};

const handlePageParamsChange = (payload: { page: number; limit: number }) => {
  currentApiParams.value.page = payload.page;
  currentApiParams.value.limit = payload.limit;
  fetchData();
};

const handleFilterSortChange = (filters: { sortBy?: string; filterText?: string }) => {
  if (filters.sortBy !== undefined) {
    currentApiParams.value.sortBy = filters.sortBy;
    currentSortBy.value = filters.sortBy;
  }
  if (filters.filterText !== undefined) {
    currentApiParams.value.filterText = filters.filterText;
    searchKeyword.value = filters.filterText;
  }
  currentApiParams.value.page = 1;
  fetchData();
};

const fetchData = () => {
  postsStore.fetchPosts(currentApiParams.value)
    .catch(error => {
      console.error('Failed to fetch posts in DiscussPage:', error);
      ElMessage.error(`加载帖子失败: ${error.message || '未知错误'}`);
    });
};

const fetchHotPosts = async () => {
  hotPostsLoading.value = true;
  try {
    await postsStore.fetchPosts({ 
      page: 1, 
      limit: 5, 
      sortBy: 'viewCount_desc' 
    });
    hotPosts.value = postsStore.posts.slice(0, 5);
  } catch (error) {
    console.error('获取热门帖子失败:', error);
  } finally {
    hotPostsLoading.value = false;
  }
};

// 生命周期
onMounted(() => {
  // 初始化参数
  currentApiParams.value.page = postsStore.pagination.currentPage;
  currentApiParams.value.limit = postsStore.pagination.pageSize;
  
  // 获取数据
  fetchData();
  fetchHotPosts();
});
</script>

<style scoped lang="scss">
.pc-discuss-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 0;
  margin-bottom: 25px;
  border-radius: 12px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;

    .header-left {
      .page-title {
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 8px 0;
      }

      .page-subtitle {
        font-size: 16px;
        opacity: 0.9;
        margin: 0;
      }
    }

    .header-right {
      .create-post-btn {
        font-size: 16px;
        padding: 12px 24px;
        height: auto;

        .el-icon {
          margin-right: 8px;
        }
      }
    }
  }
}

.main-content {
  display: flex;
  gap: 25px;
  align-items: flex-start;
}

.content-main {
  flex: 1;
  min-width: 0;

  .filter-toolbar {
    margin-bottom: 20px;
    
    :deep(.el-card__body) {
      padding: 20px;
    }

    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .search-section {
        display: flex;
        align-items: center;
        gap: 10px;

        .search-input {
          width: 300px;
        }
      }

      .filter-section {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }

    .hot-tags-section {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      padding-top: 15px;
      border-top: 1px solid #f0f0f0;

      .tags-label {
        font-size: 14px;
        color: #666;
        margin-right: 5px;
      }

      .hot-tag {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }

  .posts-container {
    :deep(.el-card__body) {
      padding: 0;
    }


  }
}

.content-sidebar {
  width: 300px;
  flex-shrink: 0;

  .el-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.el-card__header) {
      padding: 15px 20px;
      border-bottom: 1px solid #f0f0f0;

      h3 {
        margin: 0;
        font-size: 16px;
        color: #303133;
        font-weight: 600;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
        }
      }
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .quick-actions-card {
    .quick-actions {
      .el-button {
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        .el-icon {
          margin-right: 5px;
        }
      }
    }
  }

  .hot-posts-card {
    .loading-wrapper {
      padding: 10px 0;
    }

    .hot-posts-list {
      .hot-post-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: #f8f9fa;
          margin: 0 -15px;
          padding: 12px 15px;
          border-radius: 6px;
        }

        &:last-child {
          border-bottom: none;
        }

        .post-rank {
          width: 24px;
          height: 24px;
          background: #409eff;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .post-info {
          flex: 1;
          min-width: 0;

          .post-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin: 0 0 5px 0;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .post-meta {
            display: flex;
            gap: 12px;

            .post-stats {
              display: flex;
              align-items: center;
              gap: 3px;
              font-size: 12px;
              color: #909399;

              .el-icon {
                font-size: 12px;
              }
            }
          }
        }
      }
    }

    .no-hot-posts {
      text-align: center;
      padding: 20px 0;
    }
  }

  .stats-card {
    .stats-grid {
      display: flex;
      flex-direction: column;
      gap: 15px;

      .stat-item {
        display: flex;
        align-items: center;

        .stat-icon {
          width: 40px;
          height: 40px;
          background: #f0f9ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;

          .el-icon {
            font-size: 18px;
            color: #409eff;
          }
        }

        .stat-content {
          .stat-number {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
          }

          .stat-label {
            font-size: 12px;
            color: #909399;
            line-height: 1;
            margin-top: 2px;
          }
        }
      }
    }
  }

  .recent-users-card {
    .recent-users-list {
      .user-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .user-info {
          flex: 1;
          margin-left: 10px;

          .username {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            line-height: 1;
          }

          .user-role {
            font-size: 12px;
            color: #909399;
            line-height: 1;
            margin-top: 2px;
          }
        }

        .user-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;

          &.online {
            background-color: #67c23a;
          }

          &.offline {
            background-color: #909399;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .main-content {
    gap: 20px;
  }

  .content-sidebar {
    width: 280px;
  }

  .page-header {
    .header-content {
      padding: 0 20px;

      .header-left {
        .page-title {
          font-size: 28px;
        }
      }

      .header-right {
        .create-post-btn {
          font-size: 14px;
          padding: 10px 20px;
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }

  .content-sidebar {
    width: 100%;

    .el-card {
      display: inline-block;
      width: calc(50% - 10px);
      margin-right: 20px;
      vertical-align: top;

      &:nth-child(even) {
        margin-right: 0;
      }
    }
  }

  .filter-toolbar {
    .toolbar-content {
      flex-direction: column;
      align-items: stretch;
      gap: 15px;

      .search-section {
        justify-content: stretch;

        .search-input {
          width: 100%;
        }
      }

      .filter-section {
        justify-content: center;
      }
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    .header-content {
      flex-direction: column;
      text-align: center;
      gap: 20px;
    }
  }

  .content-sidebar {
    .el-card {
      display: block;
      width: 100%;
      margin-right: 0;
      margin-bottom: 15px;
    }
  }
}
</style>