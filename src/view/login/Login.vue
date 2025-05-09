<script setup lang="ts">
  import LoginPage from '@/components/login/LoginPage.vue'
  import RegisterPage from '@/components/login/RegisterPage.vue'
  import { ref } from 'vue'

  const ifLogin = ref(true)
  const changeStatus = (status: boolean) => {
    ifLogin.value = status
  }
</script>
<template>
<el-button>我是登录页面</el-button>
  <div>
    <login-page @switchToRegister="changeStatus" v-if="ifLogin"/>
    <register-page @switchToLogin="changeStatus" v-else/>
  </div>
</template>

<style>

</style>