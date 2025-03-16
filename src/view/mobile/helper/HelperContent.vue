<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {globalDepartments, GlobalTeachInfosObj} from "@/store/custom/teachInfosObj.ts";
import CourseCard from "./CourseCard.vue";
import {Items} from "@/types/Items";

// 样式
const buildingIconColor = '#606c38'

const choseBoxColor = 'rgb(255,69,137,0.1)'

const iconLib = ref([
  "bi bi-calendar-heart-fill",
  "bi bi-eraser-fill",
  "bi bi-mortarboard-fill",
  "bi bi-chat-left-text-fill",
  "bi bi-signpost-2-fill",
  "bi bi-slash-square-fill",
])


const curBuilding = defineModel()

const props = defineProps(['curDepartmentIndex'])

const buildings = computed(() => {
  return GlobalTeachInfosObj.getBuildings(globalDepartments.value[props.curDepartmentIndex])
})

const infosArray = ref<Items.TeachInfo[][]>([])


onMounted(() => {
  console.log(infosArray.value)
  GlobalTeachInfosObj.getBuildingInfosMap(
      globalDepartments.value[props.curDepartmentIndex]).forEach(
      (value, _) => {
        console.log(value)
        infosArray.value.push(value)
      }
  )
})


const pageSize = computed(() => {
  return parseInt(String(Math.ceil(buildings.value.length / 5))) // 向上整数
})

// 动作
const curScrollIndex = ref(0)
const handleScroll = (e: any) => {
  for (let i = 0; i < pageSize.value; i++) {
    if (parseInt(e.target.scrollLeft) <=
        e.target.scrollWidth / pageSize.value * (i + 1) - e.target.offsetWidth / 2) {
      curScrollIndex.value = i
      return
    }
  }
  // 0-size/3*1  size/3*1-size/3*2 size/3*2-size/3*3
}


const scrollContent = ref()
const onClickProcess = (index: number) => {
  scrollContent.value.scrollLeft = scrollContent.value.scrollWidth * index / pageSize.value
}

/// 部分教学楼，返回分页后的数据，n为页号，从0开始
const partOfBuildings = (n: number): string[] => {
  const len = buildings.value.length
  return buildings.value.slice(5 * n, Math.min(len, 5 * (n + 1)))
}

// 返回当前是哪个教学楼，便于展示数据（每次点击图标触发）
// const emits = defineEmits(['clickIcon']);

const buildingIndex = ref(0)


const contentHeight = ref('1')

const idPrefix = computed(() => 'items-' + props.curDepartmentIndex)
// 切换图标时修改高度
const onClickIcon = (index: number) => {
  // emits('clickIcon', buildings.value[index])
  console.log(curBuilding.value)
  buildingIndex.value = index
  curBuilding.value = buildings.value[index]


  contentHeight.value =
      document.getElementById(
          idPrefix.value + buildingIndex.value)?.clientHeight + 'px'
  console.log(document.getElementById(
      idPrefix.value + buildingIndex.value)?.clientHeight + 'px')

}

</script>

<template>
  <div v-if="buildings.length>0">
    <div class="relative rounded-xl overflow-auto pb-2 opacity-100">
      <div class="relative w-full flex gap-0 snap-x snap-mandatory overflow-x-auto scroll-smooth"
           ref="scrollContent"
           @scroll="handleScroll">
        <div class="snap-always snap-center shrink-0 first:pl-0 last:pr-0 w-[100%]"
             v-for="i in pageSize">

          <div class="grid grid-cols-5 pt-5 pb-5  border-l-0.5 border-r-0.5">
            <div v-for="(building,index) in partOfBuildings(i-1)" class="text-center transition-all">
              <div :style="{
            'border-color': (i-1)*5+index===buildingIndex?buildingIconColor:'rgba(255, 255, 255, 0.0)',
            'border-width':'2.5px',
            'border-radius':'20%',
            'background-color':(i-1)*5+index===buildingIndex?choseBoxColor:'rgba(255, 255, 255, 0.0)'}"
                   @click="onClickIcon((i-1)*5+index)">
                <div class="text-3xl p-0.5">
                  <i :class="iconLib[index]" :style="{'color':buildingIconColor}"></i>
                </div>
                <div class="text-1xl p-0.5 whitespace-nowrap">{{ building }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--   进度条-->
    <div class="flex flex-row place-content-center pb-4" v-if="pageSize!==1">
      <div v-for="i in pageSize">
        <div :class="{
       'w-20 h-2 rounded ml-1 mr-1':true,
       'bg-blue-500':i-1===curScrollIndex,
       'bg-blue-200':i-1!==curScrollIndex
     }" @click="onClickProcess(i-1)"></div>
      </div>
    </div>
  </div>

  <div class="bg-[#dda15e]/50">
    <div v-if="GlobalTeachInfosObj.apiErrorMsg.value!=''">
      网络异常，请通过正确的域名访问~
      {{ GlobalTeachInfosObj.apiErrorMsg }}
    </div>
    <div v-else-if="infosArray.length===0">
      <!---->
      <!--      无课图片-->
      <div class="pb-10">
        <div class="flex place-content-center">
          <img class="w-50" src="/src/assets/desk3.png" alt="">
        </div>
        <div class="text-center text-2xl">该学部这个时间没有课~</div>
      </div>
      <!---->
    </div>
    <div v-else>

      <div class="helper-content" :style="{ transform: `translateX(${-buildingIndex * 100}%)` }">
        <div v-for="(teachInfos,idx) in infosArray" :key="idx" class="helper-item">
          <div class="pt-2" :id="idPrefix+idx">
            <div class="mt-3 pb-1"
                 v-for="teachInfo in teachInfos">
              <CourseCard :teach-info="teachInfo"/>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>

</template>

<style scoped>
.helper-content {
  display: flex;
  transition: transform 0.5s ease; /* 添加过渡效果，并使用缓动函数 */
}

.helper-item {
  flex: 1;
  min-width: 100%;
  max-height: v-bind(contentHeight);
}
</style>