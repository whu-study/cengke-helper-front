<template>

  <!--  折叠面板部分-->
  <div>
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item name="1">
        <template #title>
          <img style="width: 5vw" src="/src/assets/helper/1.svg" alt="">
          <span>文理学部</span>
        </template>
        <KingArea :division-index="0">

        </KingArea>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template #title>
          <img style="width: 5vw" src="/src/assets/helper/2.svg" alt="">
          <span>工学部</span>
        </template>

        <KingArea :division-index="1">

        </KingArea>
      </el-collapse-item>
      <el-collapse-item name="3">
        <template #title>
          <img style="width: 5vw" src="/src/assets/helper/3.svg" alt="">
          <span>信息学部</span>
        </template>

        <KingArea :division-index="2">

        </KingArea>


      </el-collapse-item>
      <el-collapse-item name="4">
        <template #title>
          <img style="width: 5vw" src="/src/assets/helper/4.svg" alt="">
          <span>医学部</span>
        </template>

        <KingArea :division-index="3">

        </KingArea>

      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">

import {ref} from "vue";
import KingArea from "@/view/helper/KingArea.vue";
import {useCourseStore} from "@/store/modules/coursesStore";

const useCourse = useCourseStore();
useCourse.fetchCourseData()


const activeName = ref('1')

import { watch } from 'vue'
watch(activeName, (value: string) => {
  useCourse.setCurrentDivision(Number(value)-1)
})


</script>

<style scoped lang="scss">
.el-collapse-item span {
  margin-left: 1vw;
  font-size: 3.5vw;
}

.el-collapse-item img {
  margin-left: 2vw;
  vertical-align: middle;
}

:deep(.el-collapse-item .el-collapse-item__header) {
  background: #e8b57f;
  //border: #bc6c25 2px solid;
  margin-bottom: 1%;
  height: 10vw;
}

:deep(.el-collapse-item .el-collapse-item__content) {
  padding-bottom: 0;
}

:deep(.el-collapse-item__arrow) {
  font-size: 4vw;
}
</style>