<script setup lang="ts">

const buildingName = defineProps({
  buildingName: {
    type: String,
    required: true
  }
})
</script>

<template>
  <el-avatar shape="square" size="small"> {{buildingName}} </el-avatar>
</template>

<style scoped>
.el-avatar{
  --el-avatar-bg-color: #dda15e;
  --el-avatar-text-color: #bc6c25;
  width: 100%;
  height: 100%;
  font-size: 4vw;
  margin-bottom: 10%;
}
</style>