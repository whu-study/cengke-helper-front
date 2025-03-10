<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
import {Items} from "@/types/Items";

const infoCardColor = ref(
    // '#606c38'
    'rgba(96,108,56,0.5)'
)
const {teachInfo} =
    defineProps({
      teachInfo: Object as PropType<Items.TeachInfo>,
    })

const teachInfoRef = ref<Items.TeachInfo>({
  courseName: "", courseTime: "", courseType: "", faculty: "", room: "", teacherName: "", teacherTitle: ""
})
onMounted(() => {
  teachInfoRef.value = teachInfo ?? {
    courseName: "", courseTime: "", courseType: "",
    faculty: "", room: "", teacherName: "", teacherTitle: ""
  }
})


const bgColors = ref(['rgba(159,75,209,0.5)', 'rgba(60,110,113,0.5)'])
const borderColors = ref(['#AA5ED7', '#8ad96f'])
const fontColors = ref(['#451344', '#052a05'])

// const colorIndex = computed(() => {
//   switch (teachInfo.courseType) {
//     case '专业课':
//       return 0
//     case '通识课':
//       return 1
//     case '英语课':
//       // todo
//       console.log('todo!!!!')
//       break
//   }
//   return 0
// })


</script>

<template>
  <div class="mb-4 rounded-2xl ml-3 mr-3"
       :style="{'background-color':infoCardColor}">
    <div class="grid grid-cols-2 gap-44
    justify-between place-items-center whitespace-nowrap
 pt-[1vh]">
      <div class="text-2xl">{{ teachInfoRef.room }}</div>
      <div class="border-2 rounded-2xl pl-1.5 pr-1.5 pt-0.5 pb-0.5 text-1xl"
           :style="{'background-color':bgColors[teachInfoRef.courseType==='通识课'?1:0],'border-color':borderColors[teachInfoRef.courseType==='通识课'?1:0],'color':fontColors[teachInfoRef.courseType==='通识课'?1:0]}">
        {{ teachInfoRef.courseType }}
      </div>
    </div>
    <div class="grid grid-rows-1
    justify-center place-content-center place-items-center ml-5 mr-5 text-center
text-[150%]">
      {{ teachInfoRef.courseName }}
    </div>
    <div class="grid grid-cols-3 gap-1
    justify-between whitespace-nowrap
    text-[83%] pb-[1.1vh] pt-[1vh]">
      <div class="text-left pl-2">「{{ teachInfoRef.faculty }}」</div>
      <div class="text-center">
        <ul>
          <li>
            {{ teachInfoRef.teacherName }} {{ teachInfoRef.teacherTitle }}
          </li>
        </ul>

      </div>
      <div class="text-right pr-2">起止时间: {{ teachInfoRef.courseTime }}</div>
    </div>
  </div>
</template>

<style scoped>

</style>