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

// 获取设备类型
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
});

const useCourse = useCourseStore();

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
</style>