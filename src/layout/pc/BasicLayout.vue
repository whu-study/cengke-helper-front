<template>
  <el-container class="pc-layout">
    <!-- 顶部导航栏 -->
    <el-header class="layout-header">
      <div class="header-content">
        <!-- Logo和标题 -->
        <div class="logo-section">
          <h1 class="site-title">蹭课小助手 Pro</h1>
        </div>

        <!-- 导航菜单 -->
        <el-menu
          :default-active="currentRoute"
          mode="horizontal"
          class="nav-menu"
          @select="handleMenuSelect"
          text-color="#303133"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/home">
            <el-icon><House /></el-icon>
            <span>小助手</span>
          </el-menu-item>
          <el-menu-item index="/discuss">
            <el-icon><ChatDotSquare /></el-icon>
            <span>讨论区</span>
          </el-menu-item>
          <el-menu-item index="/publish">
            <el-icon><EditPen /></el-icon>
            <span>发布</span>
          </el-menu-item>
        </el-menu>

        <!-- 用户区域 -->
        <div class="user-section">
          <template v-if="userStore.ifLogin">
            <el-dropdown trigger="hover" @command="handleUserAction">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ userStore.userInfo?.username || '用户' }}</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="my-posts">
                    <el-icon><Document /></el-icon>
                    我的帖子
                  </el-dropdown-item>
                  <el-dropdown-item command="edit-profile">
                    <el-icon><Edit /></el-icon>
                    编辑资料
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="goToLogin">登录/注册</el-button>
          </template>
        </div>
      </div>
    </el-header>

    <!-- 主体内容 -->
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside class="layout-aside" :class="{ collapsed: asideCollapsed }">
        <div class="aside-content">
          <!-- 折叠按钮 -->
          <div class="collapse-button">
            <el-button
              circle
              size="small"
              @click="toggleAside"
              :icon="asideCollapsed ? Expand : Fold"
            />
          </div>

          <!-- 快速导航 -->
          <div v-if="!asideCollapsed" class="quick-nav">
            <h3>快速导航</h3>
            <el-menu
              :default-active="currentRoute"
              @select="handleMenuSelect"
              class="aside-menu"
            >
              <el-menu-item index="/home">
                <el-icon><House /></el-icon>
                <span>课程小助手</span>
              </el-menu-item>
              <el-menu-item index="/discuss">
                <el-icon><ChatDotSquare /></el-icon>
                <span>社区讨论</span>
              </el-menu-item>
              <el-menu-item index="/publish">
                <el-icon><EditPen /></el-icon>
                <span>发布帖子</span>
              </el-menu-item>
              <template v-if="userStore.ifLogin">
                <el-menu-item index="/profile">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-menu-item>
              </template>
            </el-menu>
          </div>

          <!-- 统计信息 -->
          <div v-if="!asideCollapsed" class="stats-section">
            <h3>社区统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <el-icon class="stat-icon"><Document /></el-icon>
                <div>
                  <div class="stat-number">{{ postsStore.pagination.totalPosts || 0 }}</div>
                  <div class="stat-label">总帖子数</div>
                </div>
              </div>
              <div class="stat-item">
                <el-icon class="stat-icon"><User /></el-icon>
                <div>
                  <div class="stat-number">在线用户</div>
                  <div class="stat-label">社区活跃</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-aside>

      <!-- 主要内容区域 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/modules/userStore';
import { usePostsStore } from '@/store/modules/postsStore';
import {
  House,
  ChatDotSquare,
  EditPen,
  User,
  ArrowDown,
  Document,
  Edit,
  SwitchButton,
  Expand,
  Fold
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const postsStore = usePostsStore();

// 响应式状态
const asideCollapsed = ref(false);

// 计算当前路由
const currentRoute = computed(() => {
  return route.path;
});

// 切换侧边栏
const toggleAside = () => {
  asideCollapsed.value = !asideCollapsed.value;
};

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  if (index !== route.path) {
    router.push(index);
  }
};

// 处理用户操作
const handleUserAction = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'my-posts':
      if (userStore.userInfo?.id) {
        router.push(`/user/${userStore.userInfo.id}/posts`);
      }
      break;
    case 'edit-profile':
      router.push('/profile/edit');
      break;
    case 'logout':
      userStore.logout();
      ElMessage.success('已退出登录');
      router.push('/home');
      break;
  }
};

// 去登录
const goToLogin = () => {
  router.push('/profile');
};

onMounted(() => {
  // 初始化时可以加载一些统计数据
  if (postsStore.pagination.totalPosts === 0) {
    // 只获取统计信息，不加载具体帖子
    postsStore.fetchPosts({ page: 1, limit: 1 });
  }
});
</script>

<style scoped lang="scss">
.pc-layout {
  min-height: 100vh;
  background-color: #f0f2f5;
}

/* 顶部导航栏 */
.layout-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid #e8e8e8;
  height: 60px;
  line-height: 60px;
  padding: 0;
  z-index: 1000;
  position: sticky;
  top: 0;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .logo-section {
    .site-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .nav-menu {
    flex: 1;
    justify-content: center;
    border: none;

    .el-menu-item {
      margin: 0 10px;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background-color: #f0f9ff;
      }

      .el-icon {
        margin-right: 5px;
      }
    }
  }

  .user-section {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 20px;
      transition: all 0.3s;

      &:hover {
        background-color: #f0f9ff;
      }

      .username {
        margin: 0 8px;
        font-size: 14px;
        color: #303133;
      }
    }
  }
}

/* 主容器 */
.main-container {
  background: #f0f2f5;
}

/* 侧边栏 */
.layout-aside {
  background: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  border-right: 1px solid #e8e8e8;
  width: 260px !important;
  transition: width 0.3s;
  overflow: hidden;

  &.collapsed {
    width: 60px !important;
  }

  .aside-content {
    padding: 20px 10px;
    height: 100%;
  }

  .collapse-button {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .quick-nav {
    margin-bottom: 30px;

    h3 {
      font-size: 14px;
      color: #909399;
      margin: 0 0 15px 15px;
      font-weight: 500;
    }

    .aside-menu {
      border: none;

      .el-menu-item {
        border-radius: 6px;
        margin-bottom: 5px;
        transition: all 0.3s;

        &:hover {
          background-color: #f0f9ff;
        }

        &.is-active {
          background-color: #e1f3ff;
          color: #409eff;
        }

        .el-icon {
          margin-right: 8px;
        }
      }
    }
  }

  .stats-section {
    h3 {
      font-size: 14px;
      color: #909399;
      margin: 0 0 15px 15px;
      font-weight: 500;
    }

    .stats-grid {
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 0 10px;

      .stat-item {
        display: flex;
        align-items: center;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background: #e3f2fd;
        }

        .stat-icon {
          font-size: 20px;
          color: #409eff;
          margin-right: 10px;
        }

        .stat-number {
          font-size: 16px;
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

/* 主要内容区域 */
.layout-main {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-content {
    padding: 0 15px;
  }

  .layout-aside {
    width: 220px !important;

    &.collapsed {
      width: 60px !important;
    }
  }

  .layout-main {
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .layout-aside {
    position: fixed;
    left: -260px;
    top: 60px;
    height: calc(100vh - 60px);
    z-index: 999;
    transition: left 0.3s;

    &:not(.collapsed) {
      left: 0;
    }
  }

  .layout-main {
    padding: 10px;
  }
}
</style>