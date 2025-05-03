<template>
  <el-drawer v-model="isGlobalDrawOpen" direction="btt" size="90%">
    <template #header>
      <h4>课程详细信息</h4>
    </template>
    <template #default>
      <div>
        {{globalCurCourseInfo.courseName}}

        <el-button @click="isGlobalDrawOpen=false">按钮</el-button>
      </div>
    </template>
    <template #footer>
      <div style="flex: auto">
        2222
      </div>
    </template>
  </el-drawer>

  <div>
    搜索
    第几周，第几节，星期几
  </div>
  <HelperRoot/>
</template>
<script setup lang="ts">

import {globalCurCourseInfo, isGlobalDrawOpen} from "@/store/custom/globalData.ts";
import HelperRoot from "@/view/helper/HelperRoot.vue";
</script>

<style scoped lang="scss">


</style>