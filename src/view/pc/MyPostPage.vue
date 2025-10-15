<template>
  <div class="pc-my-posts-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">我的帖子</h1>
          <p class="page-subtitle">管理我发布的所有帖子</p>
        </div>
        <div class="header-right">
          <el-button :icon="ArrowLeft" @click="goBack" type="info" plain>
            返回
          </el-button>
          <el-button :icon="EditPen" @click="goToPublish" type="primary">
            发布新帖
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧内容 -->
      <div class="content-main">
        <!-- 筛选工具栏 -->
        <el-card class="filter-toolbar" shadow="never">
          <div class="toolbar-content">
            <div class="filter-section">
              <el-select
                v-model="filterStatus"
                placeholder="状态筛选"
                @change="handleStatusChange"
                style="width: 120px"
              >
                <el-option label="全部" value="" />
                <el-option label="已发布" value="published" />
                <el-option label="草稿" value="draft" />
                <el-option label="已删除" value="deleted" />
              </el-select>

              <el-select
                v-model="sortBy"
                placeholder="排序方式"
                @change="handleSortChange"
                style="width: 140px"
              >
                <el-option label="最新发布" value="createdAt_desc" />
                <el-option label="最早发布" value="createdAt_asc" />
                <el-option label="最多浏览" value="viewCount_desc" />
                <el-option label="最多评论" value="commentsCount_desc" />
                <el-option label="最多点赞" value="likesCount_desc" />
              </el-select>

              <el-button :icon="Refresh" @click="handleRefresh" circle />
            </div>

            <div class="stats-section">
              <div class="stat-item">
                <span class="stat-label">总帖子:</span>
                <span class="stat-value">{{ totalPosts }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">总浏览:</span>
                <span class="stat-value">{{ totalViews }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">总点赞:</span>
                <span class="stat-value">{{ totalLikes }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 帖子列表 -->
        <el-card class="posts-container" shadow="never">
          <div v-if="postsLoading" class="loading-wrapper">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else-if="myPosts.length > 0" class="posts-list">
            <div
              v-for="post in myPosts"
              :key="post.id"
              class="post-item"
            >
              <div class="post-content">
                <div class="post-header">
                  <h3 class="post-title" @click="goToPostDetail(Number(post.id))">
                    {{ post.title }}
                  </h3>
                  <div class="post-status">
                    <el-tag type="success" size="small">
                      已发布
                    </el-tag>
                  </div>
                </div>
                
                <div class="post-excerpt">
                  {{ getExcerpt(post.content) }}
                </div>
                
                <div class="post-tags" v-if="post.tags && post.tags.length > 0">
                  <el-tag
                    v-for="tag in post.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    type="info"
                    class="tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                </div>

                <div class="post-meta">
                  <div class="meta-left">
                    <span class="post-time">
                      发布于 {{ formatDate(post.createdAt) }}
                    </span>
                    <span class="post-category" v-if="post.category">
                      {{ getCategoryText(post.category) }}
                    </span>
                  </div>
                  <div class="post-stats">
                    <span class="stat">
                      <el-icon><View /></el-icon>
                      {{ post.viewCount || 0 }}
                    </span>
                    <span class="stat">
                      <el-icon><ChatDotSquare /></el-icon>
                      {{ post.commentsCount || 0 }}
                    </span>
                    <span class="stat">
                      <el-icon><Star /></el-icon>
                      {{ post.likesCount || 0 }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="post-actions">
                <el-button
                  size="small"
                  :icon="View"
                  @click="goToPostDetail(Number(post.id))"
                >
                  查看
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  :icon="Edit"
                  @click="editPost(Number(post.id))"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  @click="deletePost(Number(post.id))"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
          <div v-else class="no-posts">
            <el-empty description="还没有发布过帖子" :image-size="80">
              <el-button type="primary" :icon="EditPen" @click="goToPublish">
                发布第一个帖子
              </el-button>
            </el-empty>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="myPosts.length > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="totalPosts"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
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
            <el-button :icon="EditPen" @click="goToPublish" type="primary" block>
              发布新帖
            </el-button>
            <el-button :icon="User" @click="goToProfile" block plain>
              个人中心
            </el-button>
            <el-button :icon="ChatDotSquare" @click="goToDiscuss" block plain>
              社区讨论
            </el-button>
          </div>
        </el-card>

        <!-- 统计概览 -->
        <el-card class="stats-overview-card" shadow="hover">
          <template #header>
            <h3>数据统计</h3>
          </template>
          <div class="stats-overview">
            <div class="overview-item">
              <div class="overview-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ totalPosts }}</div>
                <div class="overview-label">总帖子数</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-icon">
                <el-icon><View /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ totalViews }}</div>
                <div class="overview-label">总浏览量</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ totalLikes }}</div>
                <div class="overview-label">获赞总数</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-icon">
                <el-icon><ChatDotSquare /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ totalComments }}</div>
                <div class="overview-label">评论总数</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 热门帖子 -->
        <el-card class="popular-posts-card" shadow="hover">
          <template #header>
            <h3>我的热门帖子</h3>
          </template>
          <div v-if="popularPosts.length > 0" class="popular-posts-list">
            <div
              v-for="(post, index) in popularPosts"
              :key="post.id"
              class="popular-post-item"
              @click="goToPostDetail(Number(post.id))"
            >
              <div class="post-rank">{{ index + 1 }}</div>
              <div class="post-info">
                <h4 class="post-title">{{ post.title }}</h4>
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                  <span><el-icon><Star /></el-icon> {{ post.likesCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-popular-posts">
            <el-empty description="还没有热门帖子" :image-size="60" />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/modules/userStore';
import { usePostsStore } from '@/store/modules/postsStore';
import type { Post } from '@/types/discuss';

import {
  ArrowLeft,
  EditPen,
  Refresh,
  View,
  ChatDotSquare,
  Star,
  Edit,
  Delete,
  User,
  Document
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const postsStore = usePostsStore();

// 响应式状态
const myPosts = ref<Post[]>([]);
const postsLoading = ref(false);
const filterStatus = ref('');
const sortBy = ref('createdAt_desc');
const currentPage = ref(1);
const pageSize = ref(10);

// 统计数据
const totalPosts = ref(25);
const totalViews = ref(1542);
const totalLikes = ref(328);
const totalComments = ref(156);

// 热门帖子（模拟）
const popularPosts = ref([
  { id: 1, title: 'Vue.js 3.0 新特性详解', viewCount: 245, likesCount: 32 },
  { id: 2, title: 'JavaScript 异步编程最佳实践', viewCount: 189, likesCount: 28 },
  { id: 3, title: '前端性能优化技巧分享', viewCount: 167, likesCount: 25 }
]);

// 计算属性
const userId = computed(() => {
  return route.params.userId as string || userStore.userInfo?.id?.toString();
});

// 方法
const goBack = () => {
  router.go(-1);
};

const goToPublish = () => {
  router.push('/publish');
};

const goToProfile = () => {
  router.push('/profile');
};

const goToDiscuss = () => {
  router.push('/discuss');
};

const goToPostDetail = (postId: number) => {
  router.push(`/post/${postId}`);
};

const editPost = (postId: number) => {
  router.push(`/post/edit/${postId}`);
};

const deletePost = async (postId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个帖子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    // 这里应该调用删除API
    console.log('Delete post:', postId);
    ElMessage.success('帖子已删除');
    fetchMyPosts();
  } catch {
    // 用户取消了操作
  }
};

const handleStatusChange = () => {
  currentPage.value = 1;
  fetchMyPosts();
};

const handleSortChange = () => {
  currentPage.value = 1;
  fetchMyPosts();
};

const handleRefresh = () => {
  fetchMyPosts();
};

const handleCurrentChange = () => {
  fetchMyPosts();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  fetchMyPosts();
};

const fetchMyPosts = async () => {
  if (!userId.value) return;
  
  postsLoading.value = true;
  try {
    await postsStore.fetchPosts({
      page: currentPage.value,
      limit: pageSize.value,
      authorId: userId.value,
      sortBy: sortBy.value
    });
    myPosts.value = postsStore.posts;
  } catch (error) {
    console.error('获取我的帖子失败:', error);
    ElMessage.error('获取帖子失败');
  } finally {
    postsLoading.value = false;
  }
};

const getExcerpt = (content: string) => {
  if (!content) return '';
  // 移除HTML标签并截取前100个字符
  const text = content.replace(/<[^>]*>/g, '');
  return text.length > 100 ? text.substring(0, 100) + '...' : text;
};

const formatDate = (date: any) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};



const getCategoryText = (category: any) => {
  const categoryMap: Record<string, string> = {
    'study': '学习讨论',
    'review': '课程评价',
    'resource': '资源分享',
    'help': '问题求助',
    'other': '其他'
  };
  return categoryMap[category] || category;
};

// 生命周期
onMounted(() => {
  if (!userStore.ifLogin) {
    ElMessage.warning('请先登录');
    router.push('/profile');
    return;
  }
  
  fetchMyPosts();
});
</script>

<style scoped lang="scss">
.pc-my-posts-page {
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
      display: flex;
      gap: 10px;

      .el-button {
        .el-icon {
          margin-right: 5px;
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

      .filter-section {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .stats-section {
        display: flex;
        gap: 20px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;

          .stat-label {
            color: #909399;
          }

          .stat-value {
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }
  }

  .posts-container {
    :deep(.el-card__body) {
      padding: 0;
    }

    .loading-wrapper {
      padding: 30px;
    }

    .posts-list {
      .post-item {
        display: flex;
        padding: 20px 25px;
        border-bottom: 1px solid #f0f0f0;
        transition: all 0.3s;

        &:hover {
          background-color: #fafbfc;
        }

        &:last-child {
          border-bottom: none;
        }

        .post-content {
          flex: 1;
          min-width: 0;

          .post-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;

            .post-title {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
              margin: 0;
              cursor: pointer;
              transition: color 0.3s;
              line-height: 1.4;

              &:hover {
                color: #409eff;
              }
            }

            .post-status {
              flex-shrink: 0;
              margin-left: 15px;
            }
          }

          .post-excerpt {
            color: #606266;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 10px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .post-tags {
            margin-bottom: 10px;

            .tag-item {
              margin-right: 5px;
              margin-bottom: 5px;
            }
          }

          .post-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #909399;

            .meta-left {
              display: flex;
              gap: 15px;

              .post-category {
                &::before {
                  content: '•';
                  margin-right: 5px;
                }
              }
            }

            .post-stats {
              display: flex;
              gap: 15px;

              .stat {
                display: flex;
                align-items: center;
                gap: 3px;

                .el-icon {
                  font-size: 12px;
                }
              }
            }
          }
        }

        .post-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-left: 20px;
          align-self: flex-start;

          .el-button {
            width: 80px;
          }
        }
      }
    }

    .no-posts {
      padding: 60px 30px;
      text-align: center;
    }

    .pagination-wrapper {
      padding: 20px 25px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: center;
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

  .stats-overview-card {
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;

      .overview-item {
        display: flex;
        align-items: center;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;

        .overview-icon {
          width: 36px;
          height: 36px;
          background: #e3f2fd;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;

          .el-icon {
            font-size: 16px;
            color: #409eff;
          }
        }

        .overview-content {
          .overview-number {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
          }

          .overview-label {
            font-size: 11px;
            color: #909399;
            line-height: 1;
            margin-top: 2px;
          }
        }
      }
    }
  }

  .popular-posts-card {
    .popular-posts-list {
      .popular-post-item {
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

          .post-stats {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #909399;

            span {
              display: flex;
              align-items: center;
              gap: 3px;

              .el-icon {
                font-size: 12px;
              }
            }
          }
        }
      }
    }

    .no-popular-posts {
      text-align: center;
      padding: 20px 0;
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
}

@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }

  .content-sidebar {
    width: 100%;

    .stats-overview-card {
      .stats-overview {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  }

  .filter-toolbar {
    .toolbar-content {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;

      .stats-section {
        justify-content: center;
      }
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    .header-content {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }
  }

  .posts-container {
    .posts-list {
      .post-item {
        flex-direction: column;

        .post-actions {
          flex-direction: row;
          align-self: stretch;
          margin-left: 0;
          margin-top: 15px;
          justify-content: center;

          .el-button {
            width: auto;
            flex: 1;
          }
        }
      }
    }
  }

  .stats-overview-card {
    .stats-overview {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
}
</style>