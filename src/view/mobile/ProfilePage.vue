<script setup lang="ts">
import {webGetProfile} from "@/api/profile.ts";
import type {UserProfile} from "@/types/user.ts";
import {globalUserProfile} from "@/store/custom/globalData.ts";
onMounted(() => {
  webGetProfile().then((res) => {
    const userProfile = res.data as UserProfile
    globalUserProfile.value = userProfile

  })
})
</script>

<template>
  <div>
    {{globalUserProfile.username}}
  </div>
</template>

<style scoped>

</style>