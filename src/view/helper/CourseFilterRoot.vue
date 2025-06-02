<script setup lang="ts">

import {ElCol, ElEmpty, ElRow} from "element-plus";
import CourseFilter from "@/components/course/CourseFilter.vue";
import CourseCard from "@/view/helper/CourseCard.vue";
import {useCourseStore} from "@/store/modules/coursesStore.ts";
import type {CourseInfo} from "@/types/course.ts";
const coursesStore = useCourseStore();

// 从 Store 获取筛选后的课程用于显示
const filteredCoursesToDisplay = computed(() => coursesStore.filteredCourses);
const handleFilterChange = (filters: { faculty: string | null, courseId: number | null }) => {
  coursesStore.applyCourseFilters(filters);
};

const openCourseDrawer = (course: CourseInfo) => {
  coursesStore.setCurrentCourseInfo(course); // 这个方法应该会触发展示抽屉的逻辑
  // isGlobalDrawOpen.value = true; // coursesStore.setCurrentCourseInfo 内部会处理详情和评价的加载
  // isGlobalDrawOpen 应该由点击 CourseCard 内部的逻辑控制，或者这里也设置
};
</script>

<template>
  <div>
    <CourseFilter @filter-changed="handleFilterChange" />

    <div v-if="coursesStore.isLoading" class="loading-indicator">加载中...</div>
    <div v-else-if="coursesStore.error" class="error-message">错误: {{ coursesStore.error }}</div>
    <div v-else-if="filteredCoursesToDisplay.length > 0" class="filtered-courses-list">
      <el-row :gutter="16">
        <el-col
            v-for="course in filteredCoursesToDisplay"
            :key="course.id"
            :xs="24" :sm="12" :md="8" :lg="6"
        >
          <CourseCard :course-info="course" @click="openCourseDrawer(course)" />
        </el-col>
      </el-row>
    </div>
    <div v-else class="no-results">
      <el-empty description="没有找到匹配的课程" />
    </div>
  </div>
</template>

<style scoped>

</style>