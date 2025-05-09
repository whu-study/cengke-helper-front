<script setup lang="ts">

</script>

<template>
<!--  子路由出口-->
  <router-view></router-view>


  <van-tabbar route placeholder>
    <van-tabbar-item replace to="/home" icon="home-o">小助手</van-tabbar-item>
    <van-tabbar-item replace to="/discuss" icon="friends-o">讨论</van-tabbar-item>
    <van-tabbar-item replace to="/publish" icon="apps-o">发布</van-tabbar-item>
    <van-tabbar-item replace to="/profile" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>

</template>

<style scoped>

</style>