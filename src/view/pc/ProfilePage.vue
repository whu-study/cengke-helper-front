<template>
  <div class="pc-profile-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">个人中心</h1>
        <p class="page-subtitle">管理个人信息和内容</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧内容 -->
      <div class="content-main">
        <!-- 用户信息卡片 -->
        <el-card class="user-info-card" shadow="never" v-if="userStore.ifLogin">
          <template #header>
            <div class="card-header">
              <h2>个人资料</h2>
              <el-button type="primary" :icon="Edit" @click="goToEditProfile">
                编辑资料
              </el-button>
            </div>
          </template>
          
          <div class="user-profile">
            <div class="avatar-section">
              <el-avatar :size="80" :src="userStore.userInfo?.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="upload-tip">
                <el-button type="text" size="small">更换头像</el-button>
              </div>
            </div>
            
            <div class="info-section">
              <div class="basic-info">
                <h3 class="username">{{ userStore.userInfo?.username || '用户' }}</h3>
                <p class="user-role">{{ userStore.userInfo?.role || '普通用户' }}</p>
                <p class="user-bio">{{ userStore.userInfo?.bio || '这个人很懒，什么都没留下...' }}</p>
              </div>
              
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">{{ userPostsCount }}</div>
                  <div class="stat-label">我的帖子</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userCommentsCount }}</div>
                  <div class="stat-label">我的评论</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userLikesCount }}</div>
                  <div class="stat-label">获得点赞</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userFollowersCount }}</div>
                  <div class="stat-label">关注者</div>
                </div>
              </div>
            </div>
          </div>
          
          <el-divider />
          
          <div class="contact-info">
            <h4>联系信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">邮箱:</span>
                <span class="info-value">{{ userStore.userInfo?.email || '未填写' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">注册时间:</span>
                <span class="info-value">{{ formatDate(userStore.userInfo?.createdAt) }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 未登录状态 -->
        <el-card class="login-card" shadow="never" v-else>
          <div class="login-prompt">
            <el-icon class="login-icon"><UserFilled /></el-icon>
            <h2>欢迎使用蹭课小助手</h2>
            <p>登录后可以发布帖子、参与讨论、管理个人信息</p>
            
            <!-- 登录表单 -->
            <div class="auth-tabs">
              <el-tabs v-model="activeAuthTab" @tab-click="handleAuthTabClick">
                <el-tab-pane label="登录" name="login">
                  <AuthPage mode="login" @auth-success="handleAuthSuccess" />
                </el-tab-pane>
                <el-tab-pane label="注册" name="register">
                  <AuthPage mode="register" @auth-success="handleAuthSuccess" />
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </el-card>

        <!-- 我的帖子 -->
        <el-card class="my-posts-card" shadow="never" v-if="userStore.ifLogin">
          <template #header>
            <div class="card-header">
              <h3>我的帖子</h3>
              <div class="header-actions">
                <el-button type="primary" :icon="EditPen" @click="goToPublish">
                  发布新帖
                </el-button>
                <el-button type="info" plain @click="goToMyPosts">
                  查看全部
                </el-button>
              </div>
            </div>
          </template>
          
          <div v-if="myPostsLoading" class="loading-wrapper">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="myPosts.length > 0" class="posts-list">
            <PostItem
              v-for="post in myPosts"
              :key="post.id"
              :post="post"
              class="my-post-item"
            />
          </div>
          <div v-else class="no-posts">
            <el-empty description="还没有发布过帖子" :image-size="60">
              <el-button type="primary" :icon="EditPen" @click="goToPublish">
                发布第一个帖子
              </el-button>
            </el-empty>
          </div>
        </el-card>
      </div>

      <!-- 右侧边栏 -->
      <div class="content-sidebar">
        <!-- 快速操作 -->
        <el-card class="quick-actions-card" shadow="hover" v-if="userStore.ifLogin">
          <template #header>
            <h3>快速操作</h3>
          </template>
          <div class="quick-actions">
            <el-button :icon="EditPen" @click="goToPublish" block>
              发布新帖
            </el-button>
            <el-button :icon="Document" @click="goToMyPosts" block plain>
              我的帖子
            </el-button>
            <el-button :icon="Edit" @click="goToEditProfile" block plain>
              编辑资料
            </el-button>
            <el-button :icon="Setting" @click="goToSettings" block plain>
              账号设置
            </el-button>
            <el-divider />
            <el-button :icon="SwitchButton" @click="handleLogout" type="danger" plain block>
              退出登录
            </el-button>
          </div>
        </el-card>

        <!-- 最近活动 -->
        <el-card class="recent-activity-card" shadow="hover" v-if="userStore.ifLogin">
          <template #header>
            <h3>最近活动</h3>
          </template>
          <div class="activity-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">
                <el-icon v-if="activity.type === 'post'"><Document /></el-icon>
                <el-icon v-else-if="activity.type === 'comment'"><ChatDotSquare /></el-icon>
                <el-icon v-else-if="activity.type === 'like'"><Star /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-text">{{ activity.text }}</div>
                <div class="activity-time">{{ getTimeGap(new Date(), new Date(activity.time)) }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 社区排行 -->
        <el-card class="ranking-card" shadow="hover" v-if="userStore.ifLogin">
          <template #header>
            <h3>社区排行</h3>
          </template>
          <div class="ranking-stats">
            <div class="rank-item">
              <div class="rank-icon">
                <el-icon><Trophy /></el-icon>
              </div>
              <div class="rank-content">
                <div class="rank-position">#{{ userRank.posts }}</div>
                <div class="rank-label">帖子数排名</div>
              </div>
            </div>
            <div class="rank-item">
              <div class="rank-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="rank-content">
                <div class="rank-position">#{{ userRank.likes }}</div>
                <div class="rank-label">获赞数排名</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 帮助中心 -->
        <el-card class="help-card" shadow="hover">
          <template #header>
            <h3>帮助中心</h3>
          </template>
          <div class="help-links">
            <el-button type="text" @click="goToHelp('usage')">
              <el-icon><QuestionFilled /></el-icon>
              使用指南
            </el-button>
            <el-button type="text" @click="goToHelp('rules')">
              <el-icon><DocumentCopy /></el-icon>
              社区规范
            </el-button>
            <el-button type="text" @click="goToHelp('contact')">
              <el-icon><Service /></el-icon>
              联系我们
            </el-button>
            <el-button type="text" @click="goToHelp('feedback')">
              <el-icon><Message /></el-icon>
              意见反馈
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/userStore';
import { usePostsStore } from '@/store/modules/postsStore';
import { getTimeGap } from '@/utils/globalFunc';
import type { Post } from '@/types/discuss';

import AuthPage from '@/components/login/AuthPage.vue';
import PostItem from '@/components/post/PostItem.vue';

import {
  Edit,
  User,
  UserFilled,
  EditPen,
  Document,
  Setting,
  SwitchButton,
  ChatDotSquare,
  Star,
  Trophy,
  QuestionFilled,
  DocumentCopy,
  Service,
  Message
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const postsStore = usePostsStore();

// 响应式状态
const activeAuthTab = ref('login');
const myPosts = ref<Post[]>([]);
const myPostsLoading = ref(false);

// 用户统计（来自后端 ExtendedUserProfileVO）
const userPostsCount = computed(() => userStore.userInfo?.postsCount || 0);
const userCommentsCount = computed(() => userStore.userInfo?.commentsCount || 0);
const userLikesCount = computed(() => userStore.userInfo?.likesReceived || 0);
const userFollowersCount = ref(23); // 关注者暂用本地值（后端未提供）

// 用户排名（模拟）
const userRank = ref({
  posts: 156,
  likes: 89
});

// 最近活动（模拟）
const recentActivities = ref([
  {
    id: 1,
    type: 'post',
    text: '发布了新帖子《Vue.js学习心得分享》',
    time: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    type: 'comment',
    text: '评论了帖子《JavaScript异步编程》',
    time: '2024-01-14T15:45:00Z'
  },
  {
    id: 3,
    type: 'like',
    text: '点赞了帖子《数据结构与算法》',
    time: '2024-01-13T09:20:00Z'
  }
]);

// 方法
const handleAuthTabClick = (tab: any) => {
  console.log('Auth tab clicked:', tab.paneName);
};

const handleAuthSuccess = () => {
  ElMessage.success('登录成功！');
  // 登录成功后刷新页面数据
  fetchMyPosts();
};

const goToEditProfile = () => {
  router.push('/profile/edit');
};

const goToPublish = () => {
  router.push('/publish');
};

const goToMyPosts = () => {
  if (userStore.userInfo?.id) {
    router.push(`/user/${userStore.userInfo.id}/posts`);
  }
};

const goToSettings = () => {
  // 暂时跳转到编辑资料页面
  router.push('/profile/edit');
};

const goToHelp = (type: string) => {
  ElMessage.info(`跳转到${type}页面`);
  // 这里可以根据需要跳转到相应的帮助页面
};

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    userStore.logout();
    ElMessage.success('已退出登录');
    router.push('/home');
  } catch {
    // 用户取消了操作
  }
};

const formatDate = (date: any) => {
  if (!date) return '未知';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN');
};

const fetchMyPosts = async () => {
  if (!userStore.ifLogin || !userStore.userInfo?.id) return;
  
  myPostsLoading.value = true;
  try {
    await postsStore.fetchPosts({
      page: 1,
      limit: 5,
      authorId: userStore.userInfo.id,
      sortBy: 'createdAt_desc'
    });
    myPosts.value = postsStore.posts.slice(0, 5);
  } catch (error) {
    console.error('获取我的帖子失败:', error);
  } finally {
    myPostsLoading.value = false;
  }
};

// 生命周期
onMounted(() => {
  if (userStore.ifLogin) {
    // 刷新用户资料（含统计字段）和帖子
    userStore.fetchUserProfile();
    fetchMyPosts();
  }
});
</script>

<style scoped lang="scss">
.pc-profile-page {
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
    text-align: center;
    padding: 0 30px;

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
}

.main-content {
  display: flex;
  gap: 25px;
  align-items: flex-start;
}

.content-main {
  flex: 1;
  min-width: 0;

  .user-info-card,
  .login-card,
  .my-posts-card {
    margin-bottom: 25px;

    :deep(.el-card__header) {
      padding: 20px 25px;
      border-bottom: 1px solid #f0f0f0;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h2, h3 {
          margin: 0;
          font-size: 20px;
          color: #303133;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }
      }
    }

    :deep(.el-card__body) {
      padding: 25px;
    }
  }

  .user-info-card {
    .user-profile {
      display: flex;
      gap: 25px;
      margin-bottom: 25px;

      .avatar-section {
        text-align: center;

        .upload-tip {
          margin-top: 10px;
        }
      }

      .info-section {
        flex: 1;

        .basic-info {
          margin-bottom: 20px;

          .username {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            margin: 0 0 5px 0;
          }

          .user-role {
            font-size: 14px;
            color: #409eff;
            margin: 0 0 10px 0;
          }

          .user-bio {
            font-size: 14px;
            color: #606266;
            line-height: 1.5;
            margin: 0;
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;

          .stat-item {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            transition: all 0.3s;

            &:hover {
              background: #e3f2fd;
              transform: translateY(-2px);
            }

            .stat-number {
              font-size: 20px;
              font-weight: 600;
              color: #303133;
              line-height: 1;
            }

            .stat-label {
              font-size: 12px;
              color: #909399;
              line-height: 1;
              margin-top: 5px;
            }
          }
        }
      }
    }

    .contact-info {
      h4 {
        font-size: 16px;
        color: #303133;
        margin: 0 0 15px 0;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;

        .info-item {
          display: flex;
          gap: 10px;

          .info-label {
            font-weight: 500;
            color: #606266;
            min-width: 80px;
          }

          .info-value {
            color: #303133;
          }
        }
      }
    }
  }

  .login-card {
    .login-prompt {
      text-align: center;

      .login-icon {
        font-size: 64px;
        color: #409eff;
        margin-bottom: 20px;
      }

      h2 {
        font-size: 24px;
        color: #303133;
        margin: 0 0 10px 0;
      }

      p {
        color: #606266;
        margin: 0 0 30px 0;
        line-height: 1.6;
      }

      .auth-tabs {
        max-width: 400px;
        margin: 0 auto;
        text-align: left;
      }
    }
  }

  .my-posts-card {
    .loading-wrapper {
      padding: 20px 0;
    }

    .posts-list {
      .my-post-item {
        margin-bottom: 15px;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .no-posts {
      text-align: center;
      padding: 40px 0;
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

      .el-divider {
        margin: 15px 0 10px 0;
      }
    }
  }

  .recent-activity-card {
    .activity-list {
      .activity-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 15px;

        &:last-child {
          margin-bottom: 0;
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          background: #f0f9ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          flex-shrink: 0;

          .el-icon {
            font-size: 14px;
            color: #409eff;
          }
        }

        .activity-content {
          flex: 1;

          .activity-text {
            font-size: 13px;
            color: #303133;
            line-height: 1.4;
            margin-bottom: 3px;
          }

          .activity-time {
            font-size: 11px;
            color: #909399;
          }
        }
      }
    }
  }

  .ranking-card {
    .ranking-stats {
      .rank-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        &:last-child {
          margin-bottom: 0;
        }

        .rank-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;

          .el-icon {
            font-size: 18px;
            color: #b8860b;
          }
        }

        .rank-content {
          .rank-position {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
          }

          .rank-label {
            font-size: 11px;
            color: #909399;
            line-height: 1;
            margin-top: 2px;
          }
        }
      }
    }
  }

  .help-card {
    .help-links {
      display: flex;
      flex-direction: column;
      gap: 5px;

      .el-button {
        justify-content: flex-start;
        padding: 8px 0;

        .el-icon {
          margin-right: 8px;
          font-size: 14px;
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

  .user-info-card {
    .user-profile {
      .info-section {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
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

  .user-info-card {
    .user-profile {
      flex-direction: column;
      text-align: center;

      .info-section {
        .stats-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }
    }

    .contact-info {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}

@media (max-width: 768px) {
  .content-sidebar {
    .el-card {
      display: block;
      width: 100%;
      margin-right: 0;
      margin-bottom: 15px;
    }
  }

  .user-info-card {
    .user-profile {
      .info-section {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}
</style>