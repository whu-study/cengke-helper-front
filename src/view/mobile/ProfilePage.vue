<script setup lang="ts">
import {webGetProfile} from "@/api/profile.ts";
import type {UserProfile} from "@/types/user.ts";
import {globalUserProfile} from "@/store/custom/profile.ts";
import {onMounted} from 'vue'

onMounted(() => {
  webGetProfile().then((res) => {
    globalUserProfile.value = res.data as UserProfile
  })
})
</script>

<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="avatar-container">
        <img :src="globalUserProfile.avatar" alt="用户头像" class="avatar">
      </div>
      <h2 class="username">{{ globalUserProfile.username }}</h2>
    </div>
    
    <div class="profile-info">
      <div class="info-item">
        <span class="label">邮箱</span>
        <span class="value">{{ globalUserProfile.email }}</span>
      </div>
      <div class="info-item">
        <span class="label">个人简介</span>
        <span class="value">{{ globalUserProfile.bio || '暂无简介' }}</span>
      </div>
      <div class="info-item">
        <span class="label">注册时间</span>
        <span class="value">{{ new Date(globalUserProfile.createdAt).toLocaleDateString() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  overflow: hidden;
  margin-bottom: 15px;
  border: 3px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.profile-info {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  width: 80px;
  color: #666;
  font-size: 14px;
}

.value {
  flex: 1;
  color: #333;
  font-size: 14px;
}
</style>