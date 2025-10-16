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
          <el-empty 
            description="该楼层暂无课程安排" 
            :image-size="120"
            :image="emptyStateImage"
          />
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

// 导入图片资源
import division1Icon from '@/assets/helper/1.svg';
import division2Icon from '@/assets/helper/2.svg';
import division3Icon from '@/assets/helper/3.svg';
import division4Icon from '@/assets/helper/4.svg';
import emptyStateImage from '@/assets/desk3.png';

const courseStore = useCourseStore();

// 学部选项
const divisionOptions = [
  { name: '文理学部', value: 0, icon: division1Icon },
  { name: '工学部', value: 1, icon: division2Icon },
  { name: '信息学部', value: 2, icon: division3Icon },
  { name: '医学部', value: 3, icon: division4Icon }
];

// 当前选择状态
const selectedDivision = ref<number | null>(null);
const selectedBuilding = ref<number | null>(null);
const selectedFloor = ref<number | null>(null);

// 回到顶部功能
const showBackToTop = ref(false);
const scrollThreshold = 300; // 滚动超过300px显示按钮



// 计算属性
const currentBuildings = computed(() => {
  if (selectedDivision.value === null) return [];
  const rawBuildings = courseStore.getBuildingsByDivision(selectedDivision.value);
  
  console.log('rawBuildings:', rawBuildings, 'type:', typeof rawBuildings, 'isArray:', Array.isArray(rawBuildings));
  
  // 确保rawBuildings是数组
  if (!Array.isArray(rawBuildings)) {
    console.warn('rawBuildings is not an array, returning empty array');
    return [];
  }
  
  // 转换为扩展格式，添加统计信息
  return rawBuildings.map(building => ({
    ...building,
    totalCourses: building.infos?.length || 0,
    floors: building.floors || []
  }));
});

const currentFloors = computed(() => {
  if (selectedBuilding.value === null) return [];
  const building = currentBuildings.value[selectedBuilding.value];
  
  // 如果建筑有floors属性，直接使用
  if (building?.floors && building.floors.length > 0) {
    return building.floors;
  }
  
  // 否则从infos中提取楼层信息（兼容旧数据）
  if (building?.infos) {
    const floorMap = new Map<string, CourseInfo[]>();
    
    building.infos.forEach((course: CourseInfo) => {
      const room = course.room;
      // 提取楼层信息
      const floorMatch = room.match(/([A-Z])(\d)/);
      const floorName = floorMatch ? `${floorMatch[1]}楼${floorMatch[2]}层` : '其他楼层';
      
      if (!floorMap.has(floorName)) {
        floorMap.set(floorName, []);
      }
      floorMap.get(floorName)!.push(course);
    });
    
    // 转换为楼层结构
    return Array.from(floorMap.entries()).map(([floorName, courses]) => ({
      floorName,
      floorNumber: parseInt(floorName.match(/(\d)/)?.[1] || '0'),
      rooms: [...new Set(courses.map(c => c.room))],
      courses
    }));
  }
  
  return [];
});

const currentCourses = computed(() => {
  if (selectedFloor.value === null) return [];
  const floor = currentFloors.value[selectedFloor.value];
  return floor?.courses || [];
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
  // 不在这里主动请求数据，由上级组件统一管理
  // 只有在数据确实为空且没有正在加载且没有尝试过获取时才请求
  if (!courseStore.isLoading && 
      !courseStore.hasAttemptedFetch &&
      courseStore.allCoursesFlatList.length === 0 && 
      (!courseStore.courseData || courseStore.courseData.every(division => division.length === 0))) {
    console.log('MobileHelperView: 数据为空且未在加载，发起请求');
    courseStore.fetchCourseData();
  } else {
    console.log('MobileHelperView: 数据已存在、正在加载或已尝试获取，跳过请求');
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