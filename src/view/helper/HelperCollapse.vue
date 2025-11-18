<template>
  <div class="helper-container">
    <!-- 加载状态 -->
    <div v-if="useCourse.isLoading" class="loading-state">
      <el-skeleton :rows="4" animated />
      <p style="text-align: center; color: #909399; margin-top: 16px;">正在加载课程数据...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="useCourse.error" class="error-state">
      <el-alert
        :title="`数据加载失败: ${useCourse.error}`"
        type="error"
        center
        show-icon
        :closable="false"
      >
        <template #default>
          <el-button type="primary" @click="retryLoad">重新加载</el-button>
        </template>
      </el-alert>
    </div>

    <!-- 全局空状态：当前时间没有任何课程 -->
    <div v-else-if="hasAttemptedFetch && allCoursesEmpty" class="global-empty-state">
      <el-empty 
        :image-size="200"
        description=""
      >
        <template #description>
          <div class="empty-description">
            <h3>当前时间暂无课程安排</h3>
            <p class="empty-subtitle">
              {{ currentTimeInfo ? 
                `第${currentTimeInfo.weekNum}周 ${weekdayNames[currentTimeInfo.weekday]} 第${currentTimeInfo.lessonNum}节` : 
                '当前时段' 
              }}没有课程
            </p>
            <div class="empty-suggestions">
              <p>您可以：</p>
              <ul>
                <li>使用时间选择器查看其他时间的课程</li>
                <li>切换到"课程筛选"页面浏览所有课程</li>
                <li>稍后再来查看是否有新的课程安排</li>
              </ul>
            </div>
          </div>
        </template>
        <template #default>
          <div class="empty-actions">
            <el-button 
              type="primary" 
              size="large" 
              round
              @click="retryLoad"
              :icon="Refresh"
            >
              刷新课程数据
            </el-button>
            <el-button 
              size="large" 
              round
              @click="handleViewAllCourses"
              :icon="Search"
            >
              浏览所有课程
            </el-button>
          </div>
        </template>
      </el-empty>
    </div>
    
    <!-- 正常内容 -->
    <div v-else class="helper-content">
      <!-- PC端使用新的四级结构 -->
      <PcHelperView v-if="!isMobile" />
      
      <!-- 移动端使用新的四级结构 -->
      <MobileHelperView v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import PcHelperView from "./PcHelperView.vue";
import MobileHelperView from "./MobileHelperView.vue";
import { useCourseStore } from "@/store/modules/coursesStore";
import { Refresh, Search } from '@element-plus/icons-vue';

// 获取设备类型
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
});

const useCourse = useCourseStore();

// 计算属性
const hasAttemptedFetch = computed(() => useCourse.hasAttemptedFetch);
const currentTimeInfo = computed(() => useCourse.currentTimeInfo);

// 判断是否所有课程都为空
const allCoursesEmpty = computed(() => {
  return useCourse.allCoursesFlatList.length === 0 && 
         (!useCourse.courseData || useCourse.courseData.every(division => division.length === 0));
});

// 周几的名称映射
const weekdayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 定义事件发射
const emit = defineEmits<{
  switchToFilter: []
}>();

// 事件处理方法
const handleViewAllCourses = () => {
  // 触发切换到课程筛选页面的事件
  emit('switchToFilter');
};

// 重新加载数据
const retryLoad = () => {
  // 重置尝试标志，允许重新请求
  useCourse.hasAttemptedFetch = false;
  useCourse.fetchCourseData();
};

onMounted(() => {
  // 不在这里主动请求数据，由父组件（HomePage）统一管理
  // 只有在数据确实为空且没有正在加载且没有尝试过获取时才请求
  if (!useCourse.isLoading && 
      !useCourse.hasAttemptedFetch &&
      useCourse.allCoursesFlatList.length === 0 && 
      (!useCourse.courseData || useCourse.courseData.every(division => division.length === 0))) {
    console.log('HelperCollapse: 数据为空且未在加载，发起请求');
    useCourse.fetchCourseData();
  } else {
    console.log('HelperCollapse: 数据已存在、正在加载或已尝试获取，跳过请求');
  }
});
</script>

<style scoped lang="scss">
.helper-container {
  width: 100%;
  min-height: 400px;
}

.loading-state {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.error-state {
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.helper-content {
  width: 100%;
}

.global-empty-state {
  padding: 60px 40px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  
  .empty-description {
    margin-bottom: 32px;
    
    h3 {
      font-size: 24px;
      color: #303133;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .empty-subtitle {
      font-size: 16px;
      color: #606266;
      margin-bottom: 24px;
      background: rgba(255, 255, 255, 0.8);
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-block;
      font-weight: 500;
    }
    
    .empty-suggestions {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      padding: 20px;
      text-align: left;
      max-width: 400px;
      margin: 0 auto;
      
      p {
        font-size: 14px;
        color: #409eff;
        font-weight: 600;
        margin-bottom: 12px;
      }
      
      ul {
        margin: 0;
        padding-left: 20px;
        
        li {
          font-size: 14px;
          color: #606266;
          line-height: 1.8;
          margin-bottom: 6px;
        }
      }
    }
  }
  
  .empty-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    
    .el-button {
      min-width: 140px;
      height: 44px;
      font-size: 15px;
      font-weight: 500;
      
      &:first-child {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        
        &:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
      }
      
      &:last-child {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid #e4e7ed;
        color: #606266;
        
        &:hover {
          background: #fff;
          border-color: #409eff;
          color: #409eff;
          transform: translateY(-2px);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .global-empty-state {
    padding: 40px 20px;
    margin: 0 10px;
    
    .empty-description {
      h3 {
        font-size: 20px;
      }
      
      .empty-subtitle {
        font-size: 14px;
      }
      
      .empty-suggestions {
        padding: 16px;
        
        p {
          font-size: 13px;
        }
        
        ul li {
          font-size: 13px;
        }
      }
    }
    
    .empty-actions {
      flex-direction: column;
      align-items: center;
      
      .el-button {
        width: 100%;
        max-width: 280px;
      }
    }
  }
}
</style>