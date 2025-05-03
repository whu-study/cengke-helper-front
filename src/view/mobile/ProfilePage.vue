<script setup lang="ts">
import {webGetProfile} from "@/api/profile.ts";
import type {UserProfile} from "@/types/user.ts";
import {globalUserProfile} from "@/store/custom/profile.ts";
onMounted(() => {
  webGetProfile().then((res) => {
    const userProfile = res.data as UserProfile
    globalUserProfile.value = userProfile

  })
})
</script>

<template>
  <div class="my-avatar">
    <el-avatar>雪涛</el-avatar>
    {{globalUserProfile.username}}
  </div>
</template>

<style scoped>
.my-avatar {
  padding-top: 100vw;
}

</style>