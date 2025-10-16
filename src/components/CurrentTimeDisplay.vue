<template>
  <div class="current-time-display">
    <div v-if="coursesStore.isTimeLoading" class="time-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>获取时间中...</span>
    </div>
    
    <div v-else-if="coursesStore.currentTimeInfo" class="time-info">
      <!-- 当前时间显示 -->
      <div class="time-badge-container">
        <div 
          class="time-badge"
          :class="{ 'custom-time': coursesStore.isUsingCustomTime }"
          @click="showTimeSelector = !showTimeSelector"
        >
          <el-icon class="time-icon">
            <Clock v-if="!coursesStore.isUsingCustomTime" />
            <Edit v-else />
          </el-icon>
          <span class="week-info">
            第{{ displayTime.weekNum }}周
          </span>
          <span class="day-info">{{ displayTime.weekdayName }}</span>
          <span class="lesson-info">{{ displayTime.lessonStatus }}</span>
          <el-icon class="dropdown-icon" :class="{ 'rotate': showTimeSelector }">
            <ArrowDown />
          </el-icon>
        </div>

        <!-- 快捷操作按钮 -->
        <div class="quick-actions" v-if="!showTimeSelector">
          <el-button 
            size="small" 
            type="success" 
            :icon="Right" 
            @click="handleNextLesson"
            :loading="coursesStore.isLoading"
          >
            下一节
          </el-button>
          
          <el-button 
            v-if="coursesStore.isUsingCustomTime"
            size="small" 
            type="primary" 
            :icon="Refresh" 
            @click="handleResetToCurrent"
          >
            回到当前
          </el-button>
        </div>
      </div>

      <!-- 时间选择器下拉面板 -->
      <transition name="fade-slide">
        <div v-if="showTimeSelector" class="time-selector-panel">
          <div class="selector-row">
            <label>周次：</label>
            <el-select v-model="customWeekNum" size="small" style="width: 80px;">
              <el-option 
                v-for="week in 20" 
                :key="week" 
                :label="`第${week}周`" 
                :value="week" 
              />
            </el-select>
          </div>
          
          <div class="selector-row">
            <label>星期：</label>
            <el-select v-model="customWeekday" size="small" style="width: 90px;">
              <el-option label="周一" :value="1" />
              <el-option label="周二" :value="2" />
              <el-option label="周三" :value="3" />
              <el-option label="周四" :value="4" />
              <el-option label="周五" :value="5" />
              <el-option label="周六" :value="6" />
              <el-option label="周日" :value="7" />
            </el-select>
          </div>
          
          <div class="selector-row">
            <label>节次：</label>
            <el-select v-model="customLessonNum" size="small" style="width: 80px;">
              <el-option 
                v-for="lesson in 12" 
                :key="lesson" 
                :label="`第${lesson}节`" 
                :value="lesson" 
              />
            </el-select>
          </div>
          
          <div class="selector-actions">
            <el-button 
              size="small" 
              type="primary" 
              @click="handleApplyCustomTime"
              :loading="coursesStore.isLoading"
            >
              查看课程
            </el-button>
            <el-button size="small" @click="showTimeSelector = false">
              取消
            </el-button>
          </div>
        </div>
      </transition>
    </div>
    
    <div v-else class="time-error">
      <el-icon><Warning /></el-icon>
      <span>时间获取失败</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { Clock, Loading, Warning, ArrowDown, Edit, Right, Refresh } from '@element-plus/icons-vue';
import { useCourseStore } from '@/store/modules/coursesStore';
import { ElMessage } from 'element-plus';

const coursesStore = useCourseStore();
let timer: number | null = null;

// 界面状态
const showTimeSelector = ref(false);

// 自定义时间参数
const customWeekNum = ref(1);
const customWeekday = ref(1);
const customLessonNum = ref(1);

// 星期名称映射
const weekdayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 计算显示的时间信息
const displayTime = computed(() => {
  if (coursesStore.isUsingCustomTime && coursesStore.selectedTimeQuery) {
    const query = coursesStore.selectedTimeQuery;
    return {
      weekNum: query.weekNum || 1,
      weekdayName: weekdayNames[query.weekday || 1],
      lessonStatus: `第${query.lessonNum || 1}节`
    };
  } else if (coursesStore.currentTimeInfo) {
    return {
      weekNum: coursesStore.currentTimeInfo.weekNum,
      weekdayName: coursesStore.currentTimeInfo.weekdayName,
      lessonStatus: coursesStore.currentTimeInfo.lessonStatus
    };
  }
  return { weekNum: 1, weekdayName: '周一', lessonStatus: '第1节' };
});

// 初始化自定义时间参数
const initCustomTime = () => {
  if (coursesStore.currentTimeInfo) {
    customWeekNum.value = coursesStore.currentTimeInfo.weekNum;
    customWeekday.value = coursesStore.currentTimeInfo.weekday;
    customLessonNum.value = coursesStore.currentTimeInfo.lessonNum;
  }
};

// 处理下一节课
const handleNextLesson = async () => {
  try {
    await coursesStore.fetchNextLessonCourses();
    ElMessage.success('已切换到下一节课程安排');
  } catch (error) {
    ElMessage.error('获取下一节课程失败');
  }
};

// 处理回到当前时间
const handleResetToCurrent = () => {
  coursesStore.resetToCurrentTime();
  showTimeSelector.value = false;
  ElMessage.success('已回到当前时间');
};

// 应用自定义时间
const handleApplyCustomTime = () => {
  coursesStore.setCustomTimeQuery({
    weekNum: customWeekNum.value,
    weekday: customWeekday.value,
    lessonNum: customLessonNum.value
  });
  showTimeSelector.value = false;
  ElMessage.success(`已切换到第${customWeekNum.value}周${weekdayNames[customWeekday.value]}第${customLessonNum.value}节`);
};

onMounted(() => {
  // 组件挂载时获取当前时间信息
  coursesStore.fetchCurrentTime().then(() => {
    initCustomTime(); // 初始化自定义时间参数
  });
  
  // 设置定时器定期更新时间信息
  timer = setInterval(() => {
    coursesStore.fetchCurrentTime();
  }, 60000); // 每分钟更新一次
});

onUnmounted(() => {
  // 在组件卸载时清除定时器
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<style scoped lang="scss">
.current-time-display {
  display: flex;
  align-items: center;
  height: 100%;
}

.time-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
  
  .el-icon {
    font-size: 16px;
  }
}

.time-info {
  position: relative;
  
  .time-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .time-icon {
      font-size: 14px;
    }
    
    .week-info {
      font-weight: 600;
    }
    
    .day-info {
      position: relative;
      
      &::before {
        content: '•';
        margin: 0 4px;
        opacity: 0.7;
      }
    }
    
    .lesson-info {
      position: relative;
      
      &::before {
        content: '•';
        margin: 0 4px;
        opacity: 0.7;
      }
    }
  }
  
  .time-selector-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    z-index: 1000;
    min-width: 320px;
    padding: 20px;
    border: 1px solid #e4e7ed;
    
    .dropdown-header {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      
      .el-icon {
        margin-right: 8px;
        color: #409eff;
      }
    }
    
    .quick-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
      flex-wrap: wrap;
      
      .el-button {
        flex: 1;
        min-width: 0;
      }
    }
    
    .custom-selector {
      .selector-row {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 14px;
        
        .el-select {
          flex: 1;
        }
        
        .selector-label {
          font-size: 13px;
          color: #606266;
          white-space: nowrap;
          min-width: 45px;
          font-weight: 500;
        }
      }
      
      .apply-button {
        width: 100%;
        margin-top: 12px;
      }
    }
  }
}

.time-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f56c6c;
  font-size: 12px;
  
  .el-icon {
    font-size: 14px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .time-info {
    .time-badge {
      padding: 4px 8px;
      font-size: 12px;
      gap: 6px;
      
      .time-icon {
        font-size: 12px;
      }
    }
    
    .time-selector-dropdown {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90vw;
      max-width: 350px;
      margin-top: 0;
      max-height: 80vh;
      overflow-y: auto;
      
      .quick-actions {
        .el-button {
          font-size: 12px;
          padding: 8px 12px;
        }
      }
      
      .custom-selector {
        .selector-row {
          gap: 8px;
          
          .selector-label {
            font-size: 12px;
            min-width: 40px;
          }
        }
      }
    }
  }
}
</style>