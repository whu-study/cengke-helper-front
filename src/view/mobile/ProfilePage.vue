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
  <div class="my-avatar">

    {{globalUserProfile.username}}
  </div>
</template>

<style scoped>
.my-avatar {
  padding-top: 100vw;
}

</style>