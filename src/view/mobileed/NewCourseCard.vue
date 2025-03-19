<script setup lang="ts">
import { onMounted, PropType, ref } from "vue";
import { Items } from "@/types/Items";
import { globalCurCourseInfo, isGlobalDrawOpen } from "@/store/custom/globalData.ts";

const { teachInfo } =
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

const onClick = () => {
  isGlobalDrawOpen.value = true;
  globalCurCourseInfo.value = teachInfoRef.value;
}
</script>

<template>
  <el-card shadow="always" class="info-card">
    <div  @click="onClick">
      <div class="info-card-header">
        <div class="room">{{ teachInfoRef.room }}</div>
        <div></div>
        <div class="course-type"
             :style="{'background-color':bgColors[teachInfoRef.courseType==='通识课'?1:0],'border-color':borderColors[teachInfoRef.courseType==='通识课'?1:0],'color':fontColors[teachInfoRef.courseType==='通识课'?1:0]}">
          {{ teachInfoRef.courseType }}
        </div>
      </div>
      <div class="course-name">
        {{ teachInfoRef.courseName }}
      </div>
      <div class="info-card-footer">
        <div class="faculty">「{{ teachInfoRef.faculty }}」</div>
        <div class="teacher">
          <ul>
            <li>
              {{ teachInfoRef.teacherName }} {{ teachInfoRef.teacherTitle }}
            </li>
          </ul>
        </div>
        <div class="course-time">{{ teachInfoRef.courseTime }}</div>
      </div>
    </div>

  </el-card>
</template>

<style scoped lang="scss">
:deep(.el-card__body){
  padding: 0;
}
.info-card {
  margin-bottom: 3vw;
  border-radius: 1vw;
  margin-left: 3vw;
  margin-right: 3vw;
  background: #d3b883;
  &-header {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    place-items: center;
    white-space: nowrap;
    padding-top: 1vh;
    font-size: 3.5vw;

    .room {
      font-size: 5vw;
      text-align: left;
    }

    .course-type {
      //border-width: 2px;
      border-radius: 1vw;
      padding: 0.5vw 1.5vw;
      text-align: right;
    }
  }

  .course-name {
    display: grid;
    grid-template-rows: repeat(1, minmax(0, 1fr));
    justify-content: center;
    place-content: center;
    place-items: center;
    margin-left: 1.25rem;
    margin-right: 1.25rem;
    text-align: center;
    font-size: 6vw;
  }

  &-footer {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    white-space: nowrap;
    font-size: 2vw;
    padding-bottom: 1.1vh;
    padding-top: 1vh;

    .faculty {
      text-align: left;
      padding-left: 1vw;
    }

    .teacher {
      text-align: center;
    }

    .course-time {
      text-align: right;
      padding-right: 1vw;
    }
  }
}
</style>