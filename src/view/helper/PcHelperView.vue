<template>
  <div class="pc-helper">
    <!-- 页面头部 -->
    <div class="helper-header">
      <h2>武汉大学课程助手</h2>
      <p>浏览各学部教学楼的课程安排，点击课程查看详细信息</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="helper-content">
      <!-- 左侧：学部和教学楼导航 -->
      <div class="left-navigation">
        <!-- 学部选择 -->
        <div class="division-nav">
          <h3>选择学部</h3>
          <div class="division-list">
            <div
              v-for="(division, index) in divisionOptions"
              :key="index"
              class="division-item"
              :class="{ active: selectedDivision === index }"
              @click="onDivisionChange(index)"
            >
              <img :src="division.icon" :alt="division.name" class="division-icon" />
              <div class="division-info">
                <span class="division-name">{{ division.name }}</span>
                <span class="division-desc">{{ division.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 教学楼选择 -->
        <div v-if="selectedDivision !== null" class="building-nav">
          <h3>{{ divisionOptions[selectedDivision]?.name }} - 教学楼</h3>
          <div class="building-list">
            <div
              v-for="(building, index) in currentBuildings"
              :key="index"
              class="building-item"
              :class="{ active: selectedBuilding === index }"
              @click="onBuildingChange(index)"
            >
              <div class="building-info">
                <span class="building-name">{{ building.building }}</span>
                <span class="building-stats">{{ building.floors?.length || 0 }}层 • {{ building.totalCourses || 0 }}门课程</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：楼层和课程内容 -->
      <div class="right-content">
        <div v-if="selectedBuilding === null" class="empty-state">
          <el-empty 
            description="请先选择学部和教学楼" 
            :image-size="120"
            image="/src/assets/desk3.png"
          >
            <div class="empty-tips">
              <p>💡 点击左侧学部名称，然后选择教学楼</p>
              <p>🏫 查看各楼层的课程安排</p>
            </div>
          </el-empty>
        </div>        <div v-else class="building-content">
          <!-- 楼层导航 -->
          <div class="floor-navigation">
            <div class="nav-header">
              <h3>{{ currentBuildings[selectedBuilding]?.building }}</h3>
              <el-tag type="info" size="small">{{ currentBuildings[selectedBuilding]?.totalCourses }}门课程</el-tag>
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
                <span class="room-count">{{ floor.courses?.length || 0 }}门课程</span>
              </div>
            </div>
          </div>

          <!-- 课程展示区域 -->
          <div class="courses-display">
            <div v-if="selectedFloor === null" class="floor-prompt">
              <el-empty description="请选择楼层查看课程" :image-size="80" />
            </div>
            
            <div v-else class="floor-courses">
              <div class="courses-header">
                <h4>{{ currentFloors[selectedFloor]?.floorName }} - 课程安排</h4>
                <div class="courses-stats">
                  <span>{{ currentCourses.length }}门课程</span>
                  <span>{{ currentFloors[selectedFloor]?.rooms?.length || 0 }}间教室</span>
                </div>
              </div>

              <div v-if="currentCourses.length === 0" class="no-courses">
                <el-empty description="该楼层暂无课程安排" :image-size="60" />
              </div>

              <div v-else class="courses-grid">
                <CourseCard
                  v-for="course in currentCourses"
                  :key="course.id"
                  :course-info="course"
                  :is-mobile="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CourseCard from './CourseCard.vue';
import { useCourseStore } from '@/store/modules/coursesStore';
import type { CourseInfo } from '@/types/course';

// 扩展的数据接口
interface FloorInfo {
  floorName: string;
  rooms: string[];
  courses: CourseInfo[];
}

interface ExtendedBuildingInfo {
  building: string;
  floors: FloorInfo[];
  totalCourses: number;
}

const courseStore = useCourseStore();

// 学部选项
const divisionOptions = [
  { name: '文理学部', value: 0, icon: '/src/assets/helper/1.svg', description: '人文社科与理学' },
  { name: '工学部', value: 1, icon: '/src/assets/helper/2.svg', description: '工程技术学科' },
  { name: '信息学部', value: 2, icon: '/src/assets/helper/3.svg', description: '计算机与信息' },
  { name: '医学部', value: 3, icon: '/src/assets/helper/4.svg', description: '医学健康学科' }
];

// 当前选择状态
const selectedDivision = ref<number | null>(null);
const selectedBuilding = ref<number | null>(null);
const selectedFloor = ref<number | null>(null);

// 将原始数据转换为四级结构
const convertToFourLevelStructure = (buildings: any[]) => {
  return buildings.map(building => {
    const floorMap = new Map<string, CourseInfo[]>();
    
    // 按楼层分组课程
    building.infos.forEach((course: CourseInfo) => {
      const room = course.room;
      // 提取楼层信息（假设房间号格式如 A101, B205 等）
      const floorMatch = room.match(/([A-Z])(\d)/);
      const floorName = floorMatch ? `${floorMatch[1]}楼 ${floorMatch[2]}层` : '其他楼层';
      
      if (!floorMap.has(floorName)) {
        floorMap.set(floorName, []);
      }
      floorMap.get(floorName)!.push(course);
    });

    // 转换为楼层结构
    const floors: FloorInfo[] = Array.from(floorMap.entries()).map(([floorName, courses]) => ({
      floorName,
      rooms: [...new Set(courses.map(c => c.room))],
      courses
    }));

    return {
      building: building.building,
      floors,
      totalCourses: building.infos.length
    } as ExtendedBuildingInfo;
  });
};

// 计算属性
const currentBuildings = computed(() => {
  if (selectedDivision.value === null) return [];
  const rawBuildings = courseStore.getBuildingsByDivision(selectedDivision.value);
  return convertToFourLevelStructure(rawBuildings);
});

const currentFloors = computed(() => {
  if (selectedBuilding.value === null) return [];
  return currentBuildings.value[selectedBuilding.value]?.floors || [];
});

const currentCourses = computed(() => {
  if (selectedFloor.value === null) return [];
  return currentFloors.value[selectedFloor.value]?.courses || [];
});

// 事件处理
const onDivisionChange = (index: number) => {
  selectedDivision.value = index;
  selectedBuilding.value = null;
  selectedFloor.value = null;
  courseStore.setCurrentDivision(index);
};

const onBuildingChange = (index: number) => {
  selectedBuilding.value = index;
  selectedFloor.value = null;
};

const onFloorChange = (index: number) => {
  selectedFloor.value = index;
};

// 生命周期
onMounted(() => {
  // 确保数据加载
  if (!courseStore.courseData || courseStore.courseData.every(division => division.length === 0)) {
    courseStore.fetchCourseData();
  }
});
</script>

<style scoped lang="scss">
.pc-helper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.helper-header {
  text-align: center;
  margin-bottom: 32px;

  h2 {
    font-size: 28px;
    color: #303133;
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  p {
    color: #606266;
    margin: 0;
    font-size: 16px;
  }
}

.helper-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 32px;
  min-height: 600px;
}

// 左侧导航
.left-navigation {
  .division-nav,
  .building-nav {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
      color: #303133;
      margin: 0 0 16px 0;
      font-weight: 600;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
  }

  .division-list {
    .division-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 8px;

      &:hover {
        background: #f8f9fa;
      }

      &.active {
        background: linear-gradient(135deg, #faf0e6 0%, #f5e6d3 100%);
        border: 2px solid #dda15e;
      }

      .division-icon {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }

      .division-info {
        .division-name {
          display: block;
          font-size: 14px;
          color: #303133;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .division-desc {
          font-size: 11px;
          color: #909399;
        }
      }
    }
  }

  .building-list {
    .building-item {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 8px;
      border: 2px solid transparent;

      &:hover {
        background: #f8f9fa;
      }

      &.active {
        background: linear-gradient(135deg, #faf0e6 0%, #f5e6d3 100%);
        border-color: #dda15e;
      }

      .building-info {
        .building-name {
          display: block;
          font-size: 14px;
          color: #303133;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .building-stats {
          font-size: 11px;
          color: #909399;
        }
      }
    }
  }
}

// 右侧内容
.right-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;

    .empty-tips {
      margin-top: 16px;
      text-align: left;

      p {
        margin: 8px 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .building-content {
    .floor-navigation {
      margin-bottom: 24px;

      .nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
          font-size: 20px;
          color: #303133;
          margin: 0;
          font-weight: 600;
        }
      }

      .floor-tabs {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;

        .floor-tab {
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;

          &:hover {
            background: #e9ecef;
          }

          &.active {
            background: linear-gradient(135deg, #faf0e6 0%, #f5e6d3 100%);
            border-color: #dda15e;
          }

          .floor-name {
            display: block;
            font-size: 14px;
            color: #303133;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .room-count {
            font-size: 11px;
            color: #909399;
          }
        }
      }
    }

    .courses-display {
      .floor-prompt {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
      }

      .floor-courses {
        .courses-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;

          h4 {
            font-size: 18px;
            color: #303133;
            margin: 0;
            font-weight: 600;
          }

          .courses-stats {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: #909399;

            span {
              background: #f0f0f0;
              padding: 4px 8px;
              border-radius: 10px;
            }
          }
        }

        .no-courses {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .helper-content {
    grid-template-columns: 300px 1fr;
    gap: 24px;
  }

  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
  }
}

@media (max-width: 992px) {
  .helper-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .left-navigation {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .pc-helper {
    padding: 16px;
  }

  .left-navigation {
    grid-template-columns: 1fr;
  }

  .floor-tabs {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .courses-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>