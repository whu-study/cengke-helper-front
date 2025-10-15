<template>
  <div class="pc-publish-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">发布新帖</h1>
          <p class="page-subtitle">分享你的见解，开启精彩讨论</p>
        </div>
        <div class="header-right">
          <el-button :icon="ArrowLeft" @click="goBack" type="info" plain>
            返回
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧内容 - 发布表单 -->
      <div class="content-main">
        <el-card class="publish-card" shadow="never">
          <template #header>
            <div class="card-header">
              <h2>创建新帖</h2>
              <div class="tips">
                <el-icon><InfoFilled /></el-icon>
                <span>请遵守社区规范，友善交流</span>
              </div>
            </div>
          </template>

          <!-- 发布表单 -->
          <div class="publish-form-wrapper">
            <CreatePostForm
              :initial-tags="initialTags"
              @submit-form="handlePostSubmit"
              @cancel-edit="handleCancel"
              :is-pc-mode="true"
            />
          </div>
        </el-card>
      </div>

      <!-- 右侧边栏 -->
      <div class="content-sidebar">
        <!-- 发布指南 -->
        <el-card class="guide-card" shadow="hover">
          <template #header>
            <h3>发帖指南</h3>
          </template>
          <div class="guide-content">
            <div class="guide-item">
              <el-icon class="guide-icon"><Edit /></el-icon>
              <div class="guide-text">
                <h4>标题要简洁明了</h4>
                <p>用简短的语言概括帖子主要内容</p>
              </div>
            </div>
            <div class="guide-item">
              <el-icon class="guide-icon"><PriceTag /></el-icon>
              <div class="guide-text">
                <h4>添加相关标签</h4>
                <p>帮助其他用户更容易找到你的帖子</p>
              </div>
            </div>
            <div class="guide-item">
              <el-icon class="guide-icon"><ChatDotSquare /></el-icon>
              <div class="guide-text">
                <h4>内容要详细具体</h4>
                <p>提供足够的背景信息和详细描述</p>
              </div>
            </div>
            <div class="guide-item">
              <el-icon class="guide-icon"><Star /></el-icon>
              <div class="guide-text">
                <h4>保持友善态度</h4>
                <p>尊重他人观点，构建和谐社区氛围</p>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 热门标签推荐 -->
        <el-card class="tags-card" shadow="hover">
          <template #header>
            <h3>热门标签</h3>
          </template>
          <div class="recommended-tags">
            <el-tag
              v-for="tag in recommendedTags"
              :key="tag.name"
              @click="addTag(tag.name)"
              class="tag-item"
              :type="getTagType(tag.count)"
            >
              {{ tag.name }} ({{ tag.count }})
            </el-tag>
          </div>
        </el-card>

        <!-- 最近帖子 -->
        <el-card class="recent-posts-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>最新讨论</h3>
              <el-button type="primary" link @click="goToDiscuss">
                查看更多 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div v-if="recentPostsLoading" class="loading-wrapper">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="recentPosts.length > 0" class="posts-list">
            <div
              v-for="post in recentPosts"
              :key="post.id"
              class="post-item"
              @click="goToPostDetail(Number(post.id))"
            >
              <div class="post-info">
                <h4 class="post-title">{{ post.title }}</h4>
                <div class="post-meta">
                  <span class="post-author">by {{ post.author?.username }}</span>
                  <span class="post-time">{{ getTimeGap(new Date(), new Date(post.createdAt)) }}</span>
                </div>
              </div>
              <div class="post-stats">
                <span><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                <span><el-icon><ChatDotSquare /></el-icon> {{ post.commentsCount || 0 }}</span>
              </div>
            </div>
          </div>
          <div v-else class="no-posts">
            <el-empty description="暂无最新讨论" :image-size="60" />
          </div>
        </el-card>

        <!-- 用户统计 -->
        <el-card class="user-stats-card" shadow="hover" v-if="userStore.ifLogin">
          <template #header>
            <h3>我的统计</h3>
          </template>
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ userPostsCount }}</div>
                <div class="stat-label">我的帖子</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><ChatDotSquare /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ userCommentsCount }}</div>
                <div class="stat-label">我的评论</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ userLikesCount }}</div>
                <div class="stat-label">获得点赞</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 发布提醒 -->
        <el-card class="reminder-card" shadow="hover">
          <template #header>
            <h3>温馨提醒</h3>
          </template>
          <div class="reminder-content">
            <el-alert
              title="社区规范"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>发帖前请确保内容符合社区规范：</p>
                <ul>
                  <li>不发布违法、暴力、色情等不良信息</li>
                  <li>不恶意攻击他人或发表歧视言论</li>
                  <li>不发布广告或垃圾信息</li>
                  <li>尊重知识产权，注明转载来源</li>
                </ul>
              </template>
            </el-alert>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePostsStore } from '@/store/modules/postsStore';
import { useUserStore } from '@/store/modules/userStore';
import { getTimeGap } from '@/utils/globalFunc';
import type { Post } from '@/types/discuss';
import type { CreatePostBody } from '@/api/postService';
import type { FormSubmitPayload } from '@/components/post/CreatePostForm.vue';
import CreatePostForm from '@/components/post/CreatePostForm.vue';

import {
  ArrowLeft,
  ArrowRight,
  InfoFilled,
  Edit,
  PriceTag,
  ChatDotSquare,
  Star,
  View,
  Document
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const postsStore = usePostsStore();
const userStore = useUserStore();

// 响应式状态
const initialTags = ref<string[]>([]);
const recentPosts = ref<Post[]>([]);
const recentPostsLoading = ref(false);

// 推荐标签
const recommendedTags = ref([
  { name: 'JavaScript', count: 156 },
  { name: 'Vue.js', count: 89 },
  { name: '数据结构', count: 67 },
  { name: '算法', count: 45 },
  { name: '前端开发', count: 134 },
  { name: '后端开发', count: 98 },
  { name: 'Python', count: 76 },
  { name: '数据库', count: 54 },
  { name: '机器学习', count: 43 },
  { name: '网络安全', count: 32 },
]);

// 用户统计数据（模拟）
const userPostsCount = ref(12);
const userCommentsCount = ref(58);
const userLikesCount = ref(145);

// 方法
const goBack = () => {
  router.go(-1);
};

const goToDiscuss = () => {
  router.push('/discuss');
};

const goToPostDetail = (postId: number) => {
  router.push(`/post/${postId}`);
};

const addTag = (tagName: string) => {
  if (!initialTags.value.includes(tagName)) {
    initialTags.value.push(tagName);
  }
};

const getTagType = (count: number) => {
  if (count > 100) return 'danger';
  if (count > 50) return 'warning';
  return 'info';
};

const handlePostSubmit = async (payload: FormSubmitPayload) => {
  if (!payload.title || !payload.content) {
    ElMessage.error('标题和内容不能为空');
    return;
  }

  try {
    const success = await postsStore.createPost(payload as CreatePostBody);
    if (success) {
      ElMessage.success('帖子发布成功！');
      // 跳转到讨论页面或帖子详情页
      router.push('/discuss');
    } else {
      ElMessage.error(postsStore.error || '发布失败，请稍后重试');
    }
  } catch (error: any) {
    console.error('发布帖子时发生错误:', error);
    ElMessage.error(error.message || '发布时遇到未知错误');
  }
};

const handleCancel = () => {
  router.push('/discuss');
};

const fetchRecentPosts = async () => {
  recentPostsLoading.value = true;
  try {
    await postsStore.fetchPosts({ 
      page: 1, 
      limit: 5, 
      sortBy: 'createdAt_desc' 
    });
    recentPosts.value = postsStore.posts.slice(0, 5);
  } catch (error) {
    console.error('获取最新帖子失败:', error);
  } finally {
    recentPostsLoading.value = false;
  }
};

// 生命周期
onMounted(() => {
  // 检查是否已登录
  if (!userStore.ifLogin) {
    ElMessage.warning('请先登录后再发帖！');
    router.push('/profile');
    return;
  }

  // 从路由参数获取初始标签
  if (route.query.tag) {
    initialTags.value = Array.isArray(route.query.tag) 
      ? route.query.tag as string[] 
      : [route.query.tag as string];
  }

  // 获取最新帖子
  fetchRecentPosts();
});
</script>

<style scoped lang="scss">
.pc-publish-page {
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

  .publish-card {
    :deep(.el-card__header) {
      padding: 20px 25px;
      border-bottom: 1px solid #f0f0f0;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h2 {
          margin: 0;
          font-size: 20px;
          color: #303133;
          font-weight: 600;
        }

        .tips {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          color: #909399;

          .el-icon {
            color: #409eff;
          }
        }
      }
    }

    :deep(.el-card__body) {
      padding: 25px;
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

  .guide-card {
    .guide-content {
      .guide-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .guide-icon {
          font-size: 20px;
          color: #409eff;
          margin-right: 12px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .guide-text {
          flex: 1;

          h4 {
            margin: 0 0 5px 0;
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }

          p {
            margin: 0;
            font-size: 12px;
            color: #909399;
            line-height: 1.5;
          }
        }
      }
    }
  }

  .tags-card {
    .recommended-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .tag-item {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }

  .recent-posts-card {
    .loading-wrapper {
      padding: 10px 0;
    }

    .posts-list {
      .post-item {
        display: flex;
        justify-content: space-between;
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
            gap: 10px;
            font-size: 12px;
            color: #909399;
          }
        }

        .post-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
          font-size: 11px;
          color: #909399;

          span {
            display: flex;
            align-items: center;
            gap: 3px;

            .el-icon {
              font-size: 11px;
            }
          }
        }
      }
    }

    .no-posts {
      text-align: center;
      padding: 20px 0;
    }
  }

  .user-stats-card {
    .user-stats {
      .stat-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        &:last-child {
          margin-bottom: 0;
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          background: #f0f9ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;

          .el-icon {
            font-size: 16px;
            color: #409eff;
          }
        }

        .stat-content {
          .stat-number {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
          }

          .stat-label {
            font-size: 11px;
            color: #909399;
            line-height: 1;
            margin-top: 2px;
          }
        }
      }
    }
  }

  .reminder-card {
    .reminder-content {
      :deep(.el-alert) {
        .el-alert__content {
          p {
            margin: 0 0 10px 0;
            font-size: 13px;
            line-height: 1.5;
          }

          ul {
            margin: 0;
            padding-left: 18px;

            li {
              font-size: 12px;
              line-height: 1.6;
              margin-bottom: 3px;
              color: #666;

              &:last-child {
                margin-bottom: 0;
              }
            }
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
}

@media (max-width: 768px) {
  .page-header {
    .header-content {
      flex-direction: column;
      text-align: center;
      gap: 15px;
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