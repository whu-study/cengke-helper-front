<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// 确保你导入的是整合后的 user store (例如：@/store/modules/user.ts)
// 如果你的 userStore.ts (旧) 和 user.ts (新) 还没有完全整合，请先完成整合
import { useUserStore } from '@/store/modules/userStore'; // 或者 @/store/modules/user.ts，取决于你的文件名
import { ElButton, ElCard, ElAvatar, ElDivider, ElMessage, ElIcon } from 'element-plus';
import { ArrowRight, Edit, List } from '@element-plus/icons-vue'; // 引入 List 图标
import { useUserToken } from '@/store/modules/userStore';
import LoginPage from "@/components/login/LoginPage.vue";
const userStore = useUserStore();
const router = useRouter();
const drawer = ref(false);
const isLoggedIn = computed(() => userStore.ifLogin); // 使用 isAuthenticated (来自旧 userStore.ts) 或 userStore.ifLogin
const currentUser = computed(() => userStore.userInfo); // 使用 currentUser (来自旧 userStore.ts) 或 userStore.userInfo
const userToken = useUserToken();
const getAvatarUrl = (avatarPath: string | undefined | null) => {
  if (!avatarPath) {
    return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'; // 默认头像
  }
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  // 假设后端返回的是可直接访问的相对路径或完整URL；如果不是，需要拼接基础URL
  return avatarPath;
};

const formatDate = (dateString: Date | string | undefined | null) => {
  if (!dateString) return '未知';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return '日期无效';
  }
};

const goToLogin = () => {
  drawer.value = true;
};


const goToMyPosts = () => {
  if (currentUser.value?.id) {
    // 导航到新的“我的帖子”页面，通过路由参数或query传递用户ID
    router.push({ name: 'MyPosts', params: { userId: currentUser.value.id.toString() } });
    // 或者使用 query: router.push({ name: 'MyPostsList', query: { authorId: currentUser.value.id } });
    // 这取决于你如何定义 MyPosts 路由
  } else {
    ElMessage.warning('无法获取用户信息以查看帖子');
  }
};

const handleLogout = async () => {
  try {
    await userStore.logout(); // 假设 userStore 中有 logout 方法
    ElMessage.success('已成功退出登录');
    router.push('/');
  } catch (error) {
    ElMessage.error('退出登录失败，请稍后再试');
    console.error('Logout failed:', error);
  }
};

onMounted(async () => {
  // 如果 ProfilePage.txt 中的 onMounted 逻辑是获取当前登录用户的 profile
  // 并且这个逻辑尚未被 userStore.fetchUserProfile() 或登录时的逻辑覆盖，
  // 则需要确保这里能正确加载用户数据。
  // 检查 token 和用户信息是否存在
  if (userToken.token && !currentUser.value?.id) {
    try {
      await userStore.fetchUserProfile();
    } catch (error) {
      console.error('Failed to fetch user profile on mount:', error);
      // ElMessage.error('无法获取最新的用户数据');
    }
  }
});

</script>

<template>
  <div class="profile-page-container">
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <div v-if="isLoggedIn && currentUser" class="user-profile-details">
        <div class="profile-header">
          <el-avatar :size="100" :src="getAvatarUrl(currentUser.avatar)" class="user-avatar">
            <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" alt="默认头像" />
          </el-avatar>
          <h2 class="username">{{ currentUser.username || '用户' }}</h2>
        </div>

        <el-divider />

        <div class="profile-info">
          <div class="info-item">
            <span class="label">邮箱:</span>
            <span class="value">{{ currentUser.email || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">简介:</span>
            <span class="value bio-value">{{ currentUser.bio || '这位用户很神秘，什么也没留下...' }}</span>
          </div>
          <div class="info-item">
            <span class="label">用户角色:</span>
            <span class="value">{{ currentUser.role === 1 ? '管理员' : '普通用户' }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册时间:</span>
            <span class="value">{{ formatDate(currentUser.createdAt) }}</span>
          </div>
        </div>

        <el-divider />

        <div class="profile-user-actions">
          <el-button
            type="primary"
            :icon="List"
            @click="goToMyPosts"
            class="action-button my-posts-button"
            round
          >
            我的帖子
          </el-button>
          <el-button
            plain
            :icon="Edit"
            @click="router.push({ name: 'EditProfile' })"  class="action-button"
            round
          >
            编辑资料
          </el-button>
        </div>

        <el-divider />

        <div class="profile-actions">
          <el-button type="danger" plain @click="handleLogout" class="action-button">退出登录</el-button>
        </div>

      </div>

      <div v-else class="guest-view">
        <el-drawer size="100%"
            v-model="drawer"
            title="登陆注册"
            direction="btt"
        >
          <LoginPage/>
        </el-drawer>
        <p class="guest-prompt">您当前未登录，请登录后查看个人信息。</p>
        <div class="auth-buttons">
          <el-button type="primary" size="large" @click="goToLogin" class="auth-button">
            登 录
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.profile-page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 60px); /* 减去可能的导航栏高度 */
  padding: 20px;
  background-color: #f0f2f5;
}

.profile-card {
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
}

.card-header {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

.user-profile-details {
  text-align: left;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
}

.user-avatar {
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.username {
  font-size: 24px;
  color: #303133;
  font-weight: 600;
  margin: 0;
}

.profile-info {
  padding: 0 10px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  font-size: 15px;
  color: #606266;
  border-bottom: 1px solid #e4e7ed;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  width: 90px;
  color: #909399;
  font-weight: 500;
  flex-shrink: 0;
}

.value {
  flex-grow: 1;
  color: #303133;
  word-break: break-word;
}
.bio-value {
  white-space: pre-wrap;
  line-height: 1.6;
}

.profile-user-actions {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column; /* 垂直排列 */
  gap: 15px; /* 按钮间距 */
  align-items: stretch; /* 按钮宽度一致 */
}

.my-posts-button {
  /* 可以为“我的帖子”按钮添加特定样式 */
  /* background-color: #67c23a;
  border-color: #67c23a;
  color: white; */
}
/* .my-posts-button:hover {
  background-color: #85ce61;
  border-color: #85ce61;
} */


.profile-actions {
  margin-top: 20px; /* 与上方 profile-user-actions 的间距 */
  display: flex;
  justify-content: center; /* 居中退出登录按钮 */
}

.action-button {
  width: 100%; /* 让按钮在 flex 容器中占满可用宽度 */
  /* max-width: 220px; */ /* 可以取消或调整最大宽度限制 */
}


.guest-view {
  text-align: center;
  padding: 40px 20px;
}

.guest-prompt {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.auth-button {
  width: 100%;
  max-width: 280px;
  font-size: 16px;
  padding: 12px 20px;
}

@media (min-width: 768px) {
  .auth-buttons {
    flex-direction: row;
    justify-content: center;
  }
  .auth-button {
    width: auto;
    min-width: 120px;
  }
  .profile-user-actions {
    flex-direction: row; /* 在较大屏幕上水平排列 */
    justify-content: space-around;
  }
  .action-button {
     width: auto; /* 允许按钮根据内容调整宽度 */
     min-width: 150px;
  }
}
</style>