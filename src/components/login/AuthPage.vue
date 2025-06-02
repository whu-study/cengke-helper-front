<script setup lang="ts">
import LoginPage from "@/components/login/LoginPage.vue";
import RegisterPage from "@/components/login/RegisterPage.vue";
</script>

<template>
  <n-tabs
      default-value="signIn"
      size="large"
      animated
      justify-content="space-evenly" type="line"
  >
    <n-tab-pane name="signIn" tab="登录">
      <LoginPage/>
    </n-tab-pane>
    <n-tab-pane name="signup" tab="注册">
      <RegisterPage/>
    </n-tab-pane>
  </n-tabs>

</template>

<style scoped>

</style>