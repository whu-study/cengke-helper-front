<script setup lang="ts">
  import LoginPage from '@/components/login/LoginPage.vue'
  import RegisterPage from '@/components/login/RegisterPage.vue'
  import { ref } from 'vue'
  import {useRouter} from "vue-router";
  const router=useRouter()
  const ifLogin = ref(true)
  const changeStatus = (status: boolean) => {
    ifLogin.value = status
  }

  const tiaozhuan=()=>{
    router.push('/')
  }
</script>
<template>
  <el-button @click="tiaozhuan">跳转到主页</el-button>
  <div>
    <login-page @switchToRegister="changeStatus" v-if="ifLogin"/>
    <register-page @switchToLogin="changeStatus" v-else/>
  </div>
</template>

<style>

</style>