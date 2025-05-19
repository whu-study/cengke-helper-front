<script setup lang="ts">
import { onMounted,  ref } from "vue";
import type { PropType } from "vue"; // 明确导入 CourseInfo
// import { Items } from "@/types/Items"; // 移除 Items.TeachInfo 的导入
import type { CourseInfo } from "@/types/course"; // 明确导入 CourseInfo
import { useCourseStore } from "@/store/modules/coursesStore";
import { isGlobalDrawOpen } from "@/store/custom/globalData.ts";

const props = defineProps({
  // teachInfo: Object as PropType<Items.TeachInfo>, // 修改为 CourseInfo
  courseInfo: { // 将 prop 名称从 teachInfo 改为 courseInfo (或者保持 teachInfo，但类型改为 CourseInfo)
    type: Object as PropType<CourseInfo>,
    required: true // 假设课程信息是必须的
  }
})

// const teachInfoRef = ref<Items.TeachInfo>({ ... }); // 修改为 CourseInfo
const courseInfoRef = ref<CourseInfo>({ // 变量名也同步修改，或保持 teachInfoRef 但类型为 CourseInfo
  id: 0, // CourseInfo 有 id，需要初始化
  courseName: "", courseTime: "", courseType: "", faculty: "", room: "", teacherName: "", teacherTitle: ""
})

onMounted(() => {
  // teachInfoRef.value = props.teachInfo ?? { ... } // 修改
  if (props.courseInfo) {
    courseInfoRef.value = props.courseInfo;
  }
})

const courseStore = useCourseStore();

const bgColors = ref(['rgba(159,75,209,0.5)', 'rgba(60,110,113,0.5)'])
const borderColors = ref(['#AA5ED7', '#8ad96f'])
const fontColors = ref(['#451344', '#052a05'])

const onClick = () => {
  isGlobalDrawOpen.value = true;
  // courseStore.setCurrentCourseInfo(teachInfoRef.value); // 修改
  courseStore.setCurrentCourseInfo(courseInfoRef.value);
}
</script>

<template>
  <el-card shadow="always" class="info-card">
    <div @click="onClick">
      <div class="info-card-header">
        <div class="room">{{ courseInfoRef.room }}</div>
        <div></div>
        <div class="course-type"
             :style="{'background-color':bgColors[courseInfoRef.courseType==='通识课'?1:0],'border-color':borderColors[courseInfoRef.courseType==='通识课'?1:0],'color':fontColors[courseInfoRef.courseType==='通识课'?1:0]}">
          {{ courseInfoRef.courseType }}
        </div>
      </div>
      <div class="course-name">
        {{ courseInfoRef.courseName }}
      </div>
      <div class="info-card-footer">
        <div class="faculty">「{{ courseInfoRef.faculty }}」</div>
        <div class="teacher">
          <ul>
            <li>
              {{ courseInfoRef.teacherName }} {{ courseInfoRef.teacherTitle }}
            </li>
          </ul>
        </div>
        <div class="course-time">{{ courseInfoRef.courseTime }}</div>
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