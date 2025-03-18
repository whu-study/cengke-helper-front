<script setup lang="ts">

import HelperCollapse from "@/view/mobileed/HelperCollapse.vue";
import {globalCurCourseInfo, isGlobalDrawOpen} from "@/store/custom/globalData.ts";
</script>

<template>
  <el-drawer v-model="isGlobalDrawOpen" direction="btt" size="90%">
    <template #header>
      <h4>课程详细信息</h4>
    </template>
    <template #default>
      <div>
        {{globalCurCourseInfo.courseName}}
      </div>
    </template>
    <template #footer>
      <div style="flex: auto">
        2222
      </div>
    </template>
  </el-drawer>

  <HelperCollapse></HelperCollapse>
</template>

<style scoped>

</style>