<template>
  <div class="building-area" :class="{ 'pc-mode': !isMobile }">
    <!-- PC端模式 -->
    <div v-if="!isMobile" class="pc-building-selector">
      <div class="building-tabs">
        <div class="tabs-header">
          <h3>选择教学楼</h3>
          <span class="building-count">共{{ buildings.length }}个教学楼</span>
        </div>
        
        <div class="tabs-container">
          <div
            v-for="(building, index) in buildings"
            :key="index"
            class="building-tab"
            :class="{ active: segmentIndex === index }"
            @click="selectBuilding(index)"
          >
            <div class="tab-icon">
              {{ building.building[0] === '0' ? building.building.slice(0, 2) : building.building[0] }}
            </div>
            <div class="tab-text">
              <span class="building-name">{{ building.building }}</span>
              <span class="course-count">{{ building.infos.length }}个课程</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PC端课程展示 -->
      <div class="pc-course-content">
        <div v-if="selectedBuilding" class="course-section">
          <div class="section-header">
            <h4>{{ selectedBuilding.building }} - 课程列表</h4>
            <span>共{{ selectedBuilding.infos.length }}个课程</span>
          </div>
          
          <div class="course-grid">
            <CourseCard 
              v-for="courseInfo in selectedBuilding.infos" 
              :key="courseInfo.id"
              :course-info="courseInfo"
              :is-mobile="false"
            />
          </div>
        </div>
        
        <div v-else class="empty-state">
          <el-icon class="empty-icon" size="48"><DocumentCopy /></el-icon>
          <p>请选择教学楼查看课程</p>
        </div>
      </div>
    </div>

    <!-- 移动端模式：保持原有设计但优化样式 -->
    <div v-else class="mobile-building-selector">
      <div class="mobile-selector-container">
        <!-- 教学楼选择器 -->
        <div class="selector-wrapper" ref="scrollContent" @scroll="handleScroll">
          <div class="selector-page" v-for="i in totalPage" :key="i">
            <el-segmented 
              v-model="segmentIndex"
              :options="buildings.slice((i-1)*pageSize, Math.min((i-1)*pageSize+pageSize, buildings.length))"
              @change="onChange"
              class="mobile-segmented"
            >
              <template #default="scope">
                <div class="mobile-segmented-item">
                  <div class="item-icon">
                    {{ scope.item.building[0] === '0' ? scope.item.building.slice(0, 2) : scope.item.building[0] }}
                  </div>
                  <div class="item-text">{{ scope.item.building }}</div>
                </div>
              </template>
            </el-segmented>
          </div>
        </div>

        <!-- 分页指示器 -->
        <div v-if="totalPage > 1" class="page-indicator">
          <div 
            v-for="i in totalPage" 
            :key="i"
            class="indicator-dot"
            :class="{ active: (i-1) === curScrollIndex }"
            @click="onClickProcess(i-1)"
          ></div>
        </div>
      </div>

      <!-- 移动端课程展示 -->
      <div class="mobile-course-content" :style="{ height: contentHeight }">
        <div class="course-container" :style="{ transform: `translateX(${-segmentIndex * 100}%)` }">
          <div v-for="(building, idx) in buildings" :key="idx" :class="`building-courses ${className}`">
            <div v-for="courseInfo in building.infos" :key="courseInfo.id">
              <CourseCard 
                :course-info="courseInfo"
                :is-mobile="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import CourseCard from "@/view/helper/CourseCard.vue";
import {useCourseStore} from "@/store/modules/coursesStore";
import {toRef} from 'vue';
import type {BuildingInfo} from '@/types/course';

const props = defineProps<{
  divisionIndex: number;
  isMobile?: boolean;
}>();

const courseStore = useCourseStore();
const isMobile = computed(() => props.isMobile ?? true);

const buildings: Ref<BuildingInfo[]> = computed(() => {
  const val = courseStore.getBuildingsByDivision(props.divisionIndex);
  console.log(`Division ${props.divisionIndex} buildings:`, val);
  console.log('All course data:', courseStore.courseData);
  let count = 0;
  val.forEach((t) => {
    t.value = count++;
  })
  return val
})

// PC端选中的教学楼
const selectedBuilding = computed(() => {
  return buildings.value[segmentIndex.value] || null;
});

// PC端选择教学楼方法
const selectBuilding = (index: number) => {
  segmentIndex.value = index;
  onChange(index);
};

const className = ref('no' + props.divisionIndex);
const segmentIndex = ref(0);
const contentHeight = ref('400px');

const onChange = (idx: number) => {
  nextTick(() => {
    const element = document.getElementsByClassName(className.value).item(idx);
    if (element) {
      const clientHeight = element.clientHeight;
      contentHeight.value = clientHeight + 'px';
    }
  });
}


const scrollContent = ref()

const pageSize = 5;

const totalPage = computed(() => {
  return parseInt(String(Math.ceil(buildings.value.length / pageSize))) // 向上整数
})

// 动作
const curScrollIndex = ref(0)
const handleScroll = (e: any) => {
  for (let i = 0; i < totalPage.value; i++) {
    if (parseInt(e.target.scrollLeft) <=
        e.target.scrollWidth / totalPage.value * (i + 1) - e.target.offsetWidth / 2) {
      curScrollIndex.value = i
      return
    }
  }
  // 0-size/3*1  size/3*1-size/3*2 size/3*2-size/3*3
}

const onClickProcess = (index: number) => {
  scrollContent.value.scrollLeft = scrollContent.value.scrollWidth * index / totalPage.value
}

const currentDivisionRef = toRef(courseStore, 'currentDivision');

onMounted(() => {
  // 不在这里主动请求数据，依赖上级组件的数据管理
  // 只有在数据确实为空且没有正在加载时才请求
  if (!courseStore.isLoading && 
      courseStore.allCoursesFlatList.length === 0 && 
      (!courseStore.courseData || courseStore.courseData.every(division => division.length === 0))) {
    console.log('KingArea: 数据为空且未在加载，发起请求');
    courseStore.fetchCourseData();
  } else {
    console.log('KingArea: 数据已存在或正在加载，跳过请求');
  }
  
  nextTick(() => {
    const element = document.getElementsByClassName(className.value).item(segmentIndex.value);
    if (element) {
      const clientHeight = element.clientHeight;
      contentHeight.value = clientHeight + 'px';
    }
  });
  
  watch(currentDivisionRef, () => {
    nextTick(() => {
      const element = document.getElementsByClassName(className.value).item(segmentIndex.value);
      if (element) {
        const clientHeight = element.clientHeight;
        contentHeight.value = clientHeight + 'px';
      }
    })
  });
})


</script>

<style lang="scss" scoped>
.building-area {
  width: 100%;
}

/* PC端样式 */
.pc-building-selector {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  min-height: 400px;

  .building-tabs {
    .tabs-header {
      padding: 20px 0;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;

      h3 {
        font-size: 18px;
        color: #303133;
        margin: 0 0 8px 0;
        font-weight: 600;
      }

      .building-count {
        font-size: 14px;
        color: #909399;
      }
    }

    .tabs-container {
      max-height: 500px;
      overflow-y: auto;
      
      .building-tab {
        display: flex;
        align-items: center;
        padding: 16px;
        margin-bottom: 8px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        background: #f8f9fa;

        &:hover {
          background: #e9ecef;
          transform: translateX(4px);
        }

        &.active {
          background: linear-gradient(135deg, #faf0e6 0%, #f5e6d3 100%);
          border-color: #dda15e;

          .tab-icon {
            background: #dda15e;
            color: #fff;
          }
        }

        .tab-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          color: #606266;
          margin-right: 12px;
          transition: all 0.3s ease;
        }

        .tab-text {
          display: flex;
          flex-direction: column;

          .building-name {
            font-size: 15px;
            color: #303133;
            font-weight: 500;
            margin-bottom: 2px;
          }

          .course-count {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .pc-course-content {
    .course-section {
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
        border-bottom: 1px solid #f0f0f0;
        margin-bottom: 20px;

        h4 {
          font-size: 18px;
          color: #303133;
          margin: 0;
          font-weight: 600;
        }

        span {
          font-size: 14px;
          color: #909399;
        }
      }

      .course-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #909399;

      .empty-icon {
        margin-bottom: 16px;
        color: #c0c4cc;
      }

      p {
        font-size: 16px;
        margin: 0;
      }
    }
  }
}

/* 移动端样式 */
.mobile-building-selector {
  .mobile-selector-container {
    padding: 16px 0;

    .selector-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      gap: 0;
      scroll-snap-type: x mandatory;
      overflow-x: auto;
      scroll-behavior: smooth;

      .selector-page {
        scroll-snap-align: center;
        flex-shrink: 0;
        width: 100%;
        margin-bottom: 20px;

        .mobile-segmented {
          width: 100%;
          --el-segmented-item-selected-bg-color: #dda15e;

          :deep(.el-segmented__item) {
            padding: 0;
          }

          .mobile-segmented-item {
            width: 20%;
            padding: 12px 4px;
            display: flex;
            flex-direction: column;
            align-items: center;

            .item-icon {
              font-size: 18px;
              font-weight: 600;
              color: #bc6c25;
              margin-bottom: 6px;
              width: 32px;
              height: 32px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(188, 108, 37, 0.1);
            }

            .item-text {
              font-size: 12px;
              color: #bc6c25;
              text-align: center;
              line-height: 1.2;
            }
          }
        }
      }
    }

    .page-indicator {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;

      .indicator-dot {
        width: 24px;
        height: 8px;
        border-radius: 4px;
        background: #f0f0f0;
        cursor: pointer;
        transition: all 0.3s ease;

        &.active {
          background: #dda15e;
        }
      }
    }
  }

  .mobile-course-content {
    overflow: hidden;

    .course-container {
      display: flex;
      transition: transform 0.5s ease;

      .building-courses {
        width: 100vw;
        flex-shrink: 0;
        padding: 16px;

        > div {
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .pc-building-selector {
    grid-template-columns: 250px 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .pc-building-selector {
    grid-template-columns: 1fr;
    gap: 16px;

    .building-tabs .tabs-container {
      max-height: 200px;
    }
  }
}
</style>