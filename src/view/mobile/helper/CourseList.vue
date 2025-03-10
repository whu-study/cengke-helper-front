<script setup lang="ts">

import CourseCard from "./CourseCard.vue";
import {computed, onMounted, ref} from "vue";
import {GlobalTeachInfosObj} from "@/store/custom/teachInfosObj.ts";

const emits = defineProps(['curDepartment', 'curBuilding'])

const hasInfo = computed(() => {
  return GlobalTeachInfosObj.getBuildings(emits.curDepartment).length !== 0
})

const teachInfos = computed(() => {
  console.log('cb: ' + emits.curDepartment + 'cd: ' + emits.curBuilding)
  console.log('gb: ', GlobalTeachInfosObj.getTeachInfos(emits.curDepartment, emits.curBuilding))
  return GlobalTeachInfosObj.getTeachInfos(emits.curDepartment, emits.curBuilding)
})

onMounted(() => {
  console.log(GlobalTeachInfosObj.getBuildings(emits.curDepartment));
  console.log('cb: ' + emits.curDepartment + 'cd: ' + emits.curBuilding)
  console.log(hasInfo.value)
})

const isApiSomeErr = computed(() => {
  return GlobalTeachInfosObj.apiErrorMsg.value !== ''
})

const tabIndex = ref(0)
</script>

<template>
  <div class="helper-content" :style="{ transform: `translateX(${-tabIndex * 100}%)` }">
<!--    <div v-for="">-->
      <div class="bg-[#dda15e]/50 pt-2">
        <div v-if="isApiSomeErr">
          网络异常，请通过正确的域名访问~
          {{ GlobalTeachInfosObj.apiErrorMsg }}
        </div>
        <div v-else-if="!hasInfo">

          <!--      无课图片-->
          <div class="pb-10">
            <div class="flex place-content-center">
              <img class="w-50" src="/src/assets/desk3.png" alt="">
            </div>
            <div class="text-center text-2xl">该学部这个时间没有课~</div>
          </div>

        </div>
        <div v-else>
          <div>
            <div class="mt-3 pb-1"
                 v-for="teachInfo in teachInfos">
              <CourseCard :teach-info="teachInfo"/>
            </div>
          </div>
          <!---->
        </div>
      </div>
    </div>

<!--  </div>-->

</template>

<style scoped lang="scss">
.helper-content {
  display: flex;
  transition: transform 0.5s ease; /* 添加过渡效果，并使用缓动函数 */
}
</style>