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
  useCourse.fetchCourseData();
};

onMounted(() => {
  // 确保数据被获取
  if (!useCourse.courseData || useCourse.courseData.every(division => division.length === 0)) {
    useCourse.fetchCourseData();
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