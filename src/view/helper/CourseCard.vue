<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { PropType } from "vue";
import type { CourseInfo } from "@/types/course";
import { LocationFilled, OfficeBuilding, User, Clock } from '@element-plus/icons-vue';
import { useCourseStore } from "@/store/modules/coursesStore";
import { isGlobalDrawOpen } from "@/store/custom/globalData.ts";

const props = defineProps({
  courseInfo: {
    type: Object as PropType<CourseInfo>,
    required: true
  },
  isMobile: {
    type: Boolean,
    default: true
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

// 获取课程类型样式类
const getTypeClass = () => {
  return courseInfoRef.value.courseType === '通识课' ? 'general-course' : 'major-course';
};

const onClick = () => {
  isGlobalDrawOpen.value = true;
  courseStore.setCurrentCourseInfo(courseInfoRef.value);
}
</script>

<template>
  <el-card 
    shadow="always" 
    class="course-card" 
    :class="{ 'pc-mode': !isMobile, 'mobile-mode': isMobile }"
    @click="onClick"
  >
    <!-- PC端布局 -->
    <div v-if="!isMobile" class="pc-card-content">
      <div class="pc-card-header">
        <div class="room-info">
          <el-icon class="room-icon"><LocationFilled /></el-icon>
          <span class="room-text multi-room">{{ courseInfoRef.room }}</span>
        </div>
        <div class="course-type-badge" :class="getTypeClass()">
          {{ courseInfoRef.courseType }}
        </div>
      </div>
      
      <div class="course-title">
        <h4>{{ courseInfoRef.courseName }}</h4>
      </div>
      
      <div class="course-details">
        <div class="detail-item">
          <el-icon class="detail-icon"><OfficeBuilding /></el-icon>
          <span>{{ courseInfoRef.faculty }}</span>
        </div>
        <div class="detail-item">
          <el-icon class="detail-icon"><User /></el-icon>
          <span>{{ courseInfoRef.teacherName }} {{ courseInfoRef.teacherTitle }}</span>
        </div>
        <div class="detail-item time-item">
          <el-icon class="detail-icon"><Clock /></el-icon>
          <span class="multi-time">{{ courseInfoRef.courseTime }}</span>
        </div>
      </div>
    </div>

    <!-- 移动端布局：保持原有设计 -->
    <div v-else class="mobile-card-content">
      <div class="mobile-card-header">
        <div class="room">{{ courseInfoRef.room }}</div>
        <div></div>
        <div class="course-type" :class="getTypeClass()">
          {{ courseInfoRef.courseType }}
        </div>
      </div>
      
      <div class="course-name">
        {{ courseInfoRef.courseName }}
      </div>
      
      <div class="mobile-card-footer">
        <div class="faculty">「{{ courseInfoRef.faculty }}」</div>
        <div class="teacher">
          {{ courseInfoRef.teacherName }} {{ courseInfoRef.teacherTitle }}
        </div>
        <div class="course-time">{{ courseInfoRef.courseTime }}</div>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
:deep(.el-card__body) {
  padding: 0;
}

.course-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  /* PC端样式 */
  &.pc-mode {
    border-radius: 16px;
    background: linear-gradient(135deg, #faf0e6 0%, #f5e6d3 100%);

    &:hover {
      border-color: #dda15e;
    }

    .pc-card-content {
      padding: 20px;

      .pc-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .room-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .room-icon {
            color: #bc6c25;
            font-size: 16px;
          }

          .room-text {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }

        .course-type-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          border: 2px solid;

          &.general-course {
            background: rgba(60, 110, 113, 0.15);
            border-color: #8ad96f;
            color: #052a05;
          }

          &.major-course {
            background: rgba(159, 75, 209, 0.15);
            border-color: #AA5ED7;
            color: #451344;
          }
        }
      }

      .course-title {
        margin-bottom: 16px;

        h4 {
          font-size: 18px;
          color: #303133;
          margin: 0;
          font-weight: 600;
          line-height: 1.4;
          text-align: center;
        }
      }

      .course-details {
        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #606266;

          &:last-child {
            margin-bottom: 0;
          }

          .detail-icon {
            color: #bc6c25;
            font-size: 16px;
            flex-shrink: 0;
          }

          span {
            line-height: 1.4;
          }

          &.time-item {
            color: #bc6c25;
            font-weight: 500;
          }
        }

        .multi-room, .multi-time {
          line-height: 1.4;
          word-break: break-word;
          
          // 如果包含逗号或分号，表示合并的信息，使用特殊样式
          &:has-text(","), &:has-text(";") {
            font-size: 13px;
            opacity: 0.9;
          }
        }
      }
    }
  }

  /* 移动端样式：保持原有设计但优化 */
  &.mobile-mode {
    margin: 0 12px 12px 12px;
    border-radius: 12px;
    background: #d3b883;

    .mobile-card-content {
      .mobile-card-header {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        align-items: center;
        white-space: nowrap;
        padding: 12px 16px 8px;

        .room {
          font-size: 18px;
          font-weight: 600;
          color: #2c1810;
          text-align: left;
          line-height: 1.3;
          word-break: break-word;
        }

        .course-type {
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          border: 2px solid;

          &.general-course {
            background: rgba(60, 110, 113, 0.5);
            border-color: #8ad96f;
            color: #052a05;
          }

          &.major-course {
            background: rgba(159, 75, 209, 0.5);
            border-color: #AA5ED7;
            color: #451344;
          }
        }
      }

      .course-name {
        padding: 8px 20px;
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        color: #2c1810;
        line-height: 1.3;
      }

      .mobile-card-footer {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        padding: 8px 16px 12px;
        font-size: 11px;
        color: #5d3a1a;

        .faculty {
          text-align: left;
          font-weight: 500;
        }

        .teacher {
          text-align: center;
          font-weight: 500;
        }

        .course-time {
          text-align: right;
          color: #bc6c25;
          font-weight: 600;
          line-height: 1.3;
          word-break: break-word;
        }
      }
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .course-card.pc-mode {
    .pc-card-content {
      padding: 16px;

      .course-title h4 {
        font-size: 16px;
      }

      .course-details .detail-item {
        font-size: 13px;
      }
    }
  }
}
</style>