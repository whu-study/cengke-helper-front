<template>

  <!--  折叠面板部分-->
  <div class="demo-collapse">
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item name="1">
        <template #title>
          <span class="ml-2">
          <img width="20vw" src="/src/assets/helper/1.svg" alt="">
          </span>
          <span class="ml-1">文理学部</span>
        </template>

        <HelperContent
            :cur-department-index="0"
            v-model="curBuildings[0]"
        />
        <!--        <div class="bg-[#fefae0]">-->
        <!--          <KingArea-->
        <!--              :all-buildings="GlobalTeachInfosObj.getBuildings(globalDepartments.at(0)!)"-->
        <!--              v-model="curBuildings[0]"-->
        <!--          />-->
        <!--        </div>-->

        <!--        <CourseList-->
        <!--            :cur-department="globalDepartments.at(0)"-->
        <!--            :cur-building="curBuildings[0]"-->
        <!--        />-->


      </el-collapse-item>
      <el-collapse-item name="2">
        <template #title>
          <span class="ml-2">
          <img width="20vw" src="/src/assets/helper/2.svg" alt="">
          </span>
          <span class="ml-1">工学部</span>
        </template>

        <HelperContent
            :cur-department-index="1"
            v-model="curBuildings[1]"
        />


      </el-collapse-item>
      <el-collapse-item name="3">
        <template #title>
          <span class="ml-2">
          <img width="20vw" src="/src/assets/helper/3.svg" alt="">
          </span>
          <span class="ml-1">信息学部</span>
        </template>
        <HelperContent
            :cur-department-index="2"
            v-model="curBuildings[2]"
        />


      </el-collapse-item>
      <el-collapse-item name="4">
        <template #title>
          <span class="ml-2">
          <img width="20vw" src="/src/assets/helper/4.svg" alt="">
          </span>
          <span class="ml-1">医学部</span>
        </template>

        <HelperContent
            :cur-department-index="3"
            v-model="curBuildings[3]"
        />

      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">

import {ref} from "vue";
import HelperContent from "./HelperContent.vue";

const activeName = ref('1')
const curBuildings = ref(['', '', '', '', ''])
// const changeCurBuilding = (building:string)=>{
//   console.log(building)
//   curBuilding.value = building
// }
</script>

<style scoped lang="scss">
:deep(.el-collapse-item .el-collapse-item__header) {
  background: #dda15e;
  border: #bc6c25 2px solid;
  margin-bottom: 1%;
  //height: 5vw;
}

:deep(.el-collapse-item .el-collapse-item__content) {
  padding-bottom: 0;
}

</style>