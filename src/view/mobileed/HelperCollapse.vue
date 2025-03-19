<template>

  <div>
    <van-collapse v-model="activeName" accordion>
      <van-collapse-item name="1">
        <template #title>
          <div class="flex">
            <img style="width: 5vw" src="/src/assets/helper/1.svg" alt="">
            <span>文理学部</span>
          </div>
        </template>
        <KingArea :division-index="0">

        </KingArea>
      </van-collapse-item>
      <van-collapse-item name="2">
        <template #title>
          <div class="flex">
            <img style="width: 5vw" src="/src/assets/helper/2.svg" alt="">
            <span>工学部</span>
          </div>
        </template>
        <KingArea :division-index="1">

        </KingArea>
      </van-collapse-item>
      <van-collapse-item name="3">
        <template #title>
          <div class="flex">
            <img style="width: 5vw" src="/src/assets/helper/3.svg" alt="">
            <span>信息学部</span>
          </div>
        </template>
        <KingArea :division-index="2">

        </KingArea>
      </van-collapse-item>

      <van-collapse-item title="医学部" name="4">
        <KingArea :division-index="3">

        </KingArea>
      </van-collapse-item>
    </van-collapse>
  </div>


  <!--  折叠面板部分-->
  <!--  <div>-->
  <!--    <el-collapse v-model="activeName" accordion>-->
  <!--      <el-collapse-item name="1">-->
  <!--        <template #title>-->
  <!--          <img style="width: 5vw" src="/src/assets/helper/1.svg" alt="">-->
  <!--          <span>文理学部</span>-->
  <!--        </template>-->
  <!--        <KingArea :division-index="0">-->

  <!--        </KingArea>-->
  <!--      </el-collapse-item>-->
  <!--      <el-collapse-item name="2">-->
  <!--        <template #title>-->
  <!--          <img style="width: 5vw" src="/src/assets/helper/2.svg" alt="">-->
  <!--          <span>工学部</span>-->
  <!--        </template>-->

  <!--        <KingArea :division-index="1">-->

  <!--        </KingArea>-->
  <!--      </el-collapse-item>-->
  <!--      <el-collapse-item name="3">-->
  <!--        <template #title>-->
  <!--          <img style="width: 5vw" src="/src/assets/helper/3.svg" alt="">-->
  <!--          <span>信息学部</span>-->
  <!--        </template>-->

  <!--        <KingArea :division-index="2">-->

  <!--        </KingArea>-->


  <!--      </el-collapse-item>-->
  <!--      <el-collapse-item name="4">-->
  <!--        <template #title>-->
  <!--          <img style="width: 5vw" src="/src/assets/helper/4.svg" alt="">-->
  <!--          <span>医学部</span>-->
  <!--        </template>-->

  <!--        <KingArea :division-index="3">-->

  <!--        </KingArea>-->

  <!--      </el-collapse-item>-->
  <!--    </el-collapse>-->
  <!--  </div>-->
</template>

<script setup lang="ts">

import {ref} from "vue";
import KingArea from "@/view/mobileed/NewKingArea.vue";
import {useCourseStore} from "@/store/modules/courseInfosStore.ts";

const useCourse = useCourseStore();
useCourse.fetchCourseData()


const activeName = ref('1')

watch(activeName, (value, oldValue) => {
  useCourse.setCurrentDivision(Number(value) - 1)
})


</script>

<style scoped lang="scss">
:deep(.van-cell) {
  height: 10vw;
  background: #e8b57f;
  margin-bottom: 1%;
  align-items: center;
  justify-content: center;
}

:deep(.van-cell__right-icon){
  font-size: 4vw;
}

.van-cell__title span {
  margin-left: 1vw;
  font-size: 3.5vw;
  line-height: 100%
}

.van-cell__title img {
  margin-left: 2vw;
  vertical-align: middle;
}

// el

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