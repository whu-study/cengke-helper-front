<template>
  <div class="mobile-helper">
    <!-- 学部选择（第一级） -->
    <div class="division-selector">
      <el-segmented 
        v-model="selectedDivision" 
        :options="divisionOptions" 
        size="large"
        @change="onDivisionChange"
      >
        <template #default="{ item }">
          <div class="division-item">
            <img :src="item.icon" :alt="item.name" class="division-icon" />
            <span class="division-name">{{ item.name }}</span>
          </div>
        </template>
      </el-segmented>
    </div>

    <!-- 教学楼选择（第二级） -->
    <div v-if="selectedDivision !== null" class="building-selector">
      <div class="selector-header">
        <h3>{{ divisionOptions[selectedDivision]?.name }} - 选择教学楼</h3>
      </div>
      
      <div class="building-grid">
        <div
          v-for="(building, index) in currentBuildings"
          :key="index"
          class="building-card"
          :class="{ active: selectedBuilding === index }"
          @click="onBuildingChange(index)"
        >
          <div class="building-info">
            <div class="building-name">{{ building.building }}</div>
            <div class="building-stats">{{ building.floors?.length || 0 }}层 • {{ building.totalCourses || 0 }}门课程</div>
          </div>
          <div class="building-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 楼层选择（第三级） -->
    <div v-if="selectedBuilding !== null" class="floor-selector">
      <div class="selector-header">
        <h4>{{ currentBuildings[selectedBuilding]?.building }} - 选择楼层</h4>
      </div>
      
      <div class="floor-tabs">
        <div
          v-for="(floor, index) in currentFloors"
          :key="index"
          class="floor-tab"
          :class="{ active: selectedFloor === index }"
          @click="onFloorChange(index)"
        >
          <span class="floor-name">{{ floor.floorName }}</span>
          <span class="room-count">{{ floor.rooms?.length || 0 }}间教室</span>
        </div>
      </div>
    </div>

    <!-- 课程列表（第四级） -->
    <div v-if="selectedFloor !== null" class="courses-section">
      <div class="section-header">
        <h4>{{ currentFloors[selectedFloor]?.floorName }} - 课程安排</h4>
        <span class="course-count">共{{ currentCourses.length }}门课程</span>
      </div>
      
      <div class="courses-list">
        <div v-if="currentCourses.length === 0" class="empty-courses">
          <el-empty description="该楼层暂无课程安排" :image-size="60" />
        </div>
        <div v-else class="course-items">
          <CourseCard
            v-for="course in currentCourses"
            :key="course.id"
            :course-info="course"
            :is-mobile="true"
          />
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <transition name="fade-slide">
      <div
        v-if="showBackToTop"
        class="back-to-top"
        @click="scrollToTop"
      >
        <el-icon class="back-icon"><Top /></el-icon>
        <span class="back-text">顶部</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ArrowRight, Top } from '@element-plus/icons-vue';
import CourseCard from './CourseCard.vue';
import { useCourseStore } from '@/store/modules/coursesStore';
import type { CourseInfo } from '@/types/course';
import type { CourseInfo as NewCourseInfo, TimeSlot } from '@/types/courseNew';
import { generateNewMockData, FloorDataAdapter } from '@/utils/newMockData';

const courseStore = useCourseStore();

// 学部选项
const divisionOptions = [
  { name: '文理学部', value: 0, icon: '/src/assets/helper/1.svg' },
  { name: '工学部', value: 1, icon: '/src/assets/helper/2.svg' },
  { name: '信息学部', value: 2, icon: '/src/assets/helper/3.svg' },
  { name: '医学部', value: 3, icon: '/src/assets/helper/4.svg' }
];

// 当前选择状态
const selectedDivision = ref<number | null>(null);
const selectedBuilding = ref<number | null>(null);
const selectedFloor = ref<number | null>(null);

// 回到顶部功能
const showBackToTop = ref(false);
const scrollThreshold = 300; // 滚动超过300px显示按钮

// 新数据适配器
const newMockData = generateNewMockData();
const dataAdapter = new FloorDataAdapter(newMockData);

// 将新的CourseInfo转换为旧的CourseInfo格式
const convertNewCourseToOld = (newCourse: NewCourseInfo): CourseInfo => {
  // 格式化时间段
  const formatTimeSlots = (timeSlots: TimeSlot[]): string => {
    if (!timeSlots || timeSlots.length === 0) return '';
    
    const dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    return timeSlots.map(slot => 
      `${dayNames[slot.dayOfWeek]} ${slot.startPeriod}-${slot.endPeriod}节`
    ).join(' ');
  };

  return {
    id: newCourse.id,
    room: newCourse.room,
    faculty: newCourse.faculty,
    courseName: newCourse.courseName,
    teacherName: newCourse.teacherName,
    teacherTitle: newCourse.teacherTitle,
    courseTime: formatTimeSlots(newCourse.timeSlots),
    courseType: newCourse.courseType
  };
};

// 计算属性
const currentBuildings = computed(() => {
  if (selectedDivision.value === null) return [];
  return dataAdapter.getBuildingsByDivision(selectedDivision.value);
});

const currentFloors = computed(() => {
  if (selectedDivision.value === null || selectedBuilding.value === null) return [];
  return dataAdapter.getBuildingFloors(selectedDivision.value, selectedBuilding.value);
});

const currentCourses = computed(() => {
  if (selectedDivision.value === null || selectedBuilding.value === null || selectedFloor.value === null) return [];
  const newCourses = dataAdapter.getFloorCourses(selectedDivision.value, selectedBuilding.value, selectedFloor.value);
  return newCourses.map(convertNewCourseToOld);
});

// 事件处理
const onDivisionChange = (value: number) => {
  selectedDivision.value = value;
  selectedBuilding.value = null;
  selectedFloor.value = null;
  courseStore.setCurrentDivision(value);
};

const onBuildingChange = (index: number) => {
  selectedBuilding.value = index;
  selectedFloor.value = null;
};

const onFloorChange = (index: number) => {
  selectedFloor.value = index;
};

// 滚动事件处理
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
  showBackToTop.value = scrollTop > scrollThreshold;
};

// 回到顶部方法
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 生命周期
onMounted(() => {
  // 确保数据加载
  if (!courseStore.courseData || courseStore.courseData.every(division => division.length === 0)) {
    courseStore.fetchCourseData();
  }
  
  // 默认选择第一个学部
  selectedDivision.value = 0;
  courseStore.setCurrentDivision(0);

  // 添加滚动监听
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped lang="scss">
.mobile-helper {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}

// 学部选择器
.division-selector {
  margin-bottom: 20px;

  :deep(.el-segmented) {
    width: 100%;
    --el-segmented-item-selected-bg-color: #dda15e;
    --el-segmented-bg-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-segmented__item) {
    padding: 12px 8px;
    border-radius: 8px;
  }

  .division-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    .division-icon {
      width: 24px;
      height: 24px;
    }

    .division-name {
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      line-height: 1.2;
    }
  }
}

// 教学楼选择器
.building-selector {
  margin-bottom: 20px;

  .selector-header {
    margin-bottom: 16px;

    h3 {
      font-size: 18px;
      color: #303133;
      margin: 0;
      font-weight: 600;
    }
  }

  .building-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;

    .building-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #fff;
      border-radius: 12px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }

      &.active {
        border-color: #dda15e;
        background: linear-gradient(135deg, #faf0e6 0%, #f5e6d3 100%);
      }

      .building-info {
        .building-name {
          font-size: 16px;
          color: #303133;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .building-stats {
          font-size: 12px;
          color: #909399;
        }
      }

      .building-arrow {
        color: #c0c4cc;
        font-size: 16px;
        transition: all 0.3s ease;
      }

      &.active .building-arrow {
        color: #dda15e;
      }
    }
  }
}

// 楼层选择器
.floor-selector {
  margin-bottom: 20px;

  .selector-header {
    margin-bottom: 16px;

    h4 {
      font-size: 16px;
      color: #303133;
      margin: 0;
      font-weight: 600;
    }
  }

  .floor-tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;

    .floor-tab {
      padding: 12px;
      background: #fff;
      border-radius: 8px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

      &:hover {
        border-color: #e9ecef;
      }

      &.active {
        border-color: #dda15e;
        background: linear-gradient(135deg, #faf0e6 0%, #f5e6d3 100%);
      }

      .floor-name {
        display: block;
        font-size: 14px;
        color: #303133;
        font-weight: 500;
        margin-bottom: 2px;
      }

      .room-count {
        font-size: 11px;
        color: #909399;
      }
    }
  }
}

// 课程区域
.courses-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

    h4 {
      font-size: 16px;
      color: #303133;
      margin: 0;
      font-weight: 600;
    }

    .course-count {
      font-size: 12px;
      color: #909399;
      background: #f0f0f0;
      padding: 2px 8px;
      border-radius: 10px;
    }
  }

  .courses-list {
    .empty-courses {
      background: #fff;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .course-items {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
}

// 回到顶部按钮
.back-to-top {
  position: fixed;
  right: 20px;
  bottom: 120px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #dda15e 0%, #bc6c25 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(221, 161, 94, 0.3);
  z-index: 1000;
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(221, 161, 94, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  .back-icon {
    font-size: 18px;
    color: #fff;
    margin-bottom: 2px;
  }

  .back-text {
    font-size: 10px;
    color: #fff;
    font-weight: 500;
    line-height: 1;
  }
}

// 动画效果
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

// 响应式调整
@media (max-width: 480px) {
  .mobile-helper {
    padding: 12px;
  }

  .floor-tabs {
    grid-template-columns: 1fr !important;
  }

  .division-item {
    .division-icon {
      width: 20px;
      height: 20px;
    }

    .division-name {
      font-size: 11px;
    }
  }

  .back-to-top {
    right: 16px;
    bottom: 100px;
    width: 48px;
    height: 48px;

    .back-icon {
      font-size: 16px;
    }

    .back-text {
      font-size: 9px;
    }
  }
}
</style>