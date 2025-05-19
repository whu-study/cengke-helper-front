<template>
    <div class="course-filter-container">
      <el-row :gutter="20" align="middle">
        <el-col :xs="24" :sm="10">
          <el-select
            v-model="selectedFaculty"
            placeholder="请选择学院"
            clearable
            filterable
            style="width: 100%;"
            @change="handleFacultyChange"
            @clear="handleFacultyClear"
          >
            <el-option
              v-for="faculty in facultyOptions"
              :key="faculty.value"
              :label="faculty.label"
              :value="faculty.value"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="10">
          <el-select
            v-model="selectedCourseName"
            placeholder="请选择或输入课程名"
            clearable
            filterable
            remote
            :remote-method="searchCourseNames"
            :loading="courseNameLoading"
            style="width: 100%;"
            @change="handleCourseNameChange"
            @clear="handleCourseNameClear"
            :disabled="!selectedFaculty && facultyOptions.length > 0"
          >
            <el-option
              v-for="course in courseNameOptions"
              :key="course.id"
              :label="course.courseName"
              :value="course.id"
            />
            <template #empty v-if="courseNameLoading">
              <p style="text-align: center;">加载中...</p>
            </template>
             <template #empty v-else-if="selectedFaculty && courseNameOptions.length === 0 && !courseNameLoading">
              <p style="text-align: center;">该学院下无匹配课程</p>
            </template>
            <template #empty v-else-if="!selectedFaculty && facultyOptions.length > 0">
              <p style="text-align: center;">请先选择学院</p>
            </template>
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="4">
          <el-button type="primary" @click="applyFilters" style="width: 100%;">筛选</el-button>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { ElSelect, ElOption, ElRow, ElCol, ElButton } from 'element-plus';
  import { useCourseStore } from '@/store/modules/coursesStore';
  import type { CourseInfo } from '@/types/course';
  
  const courseStore = useCourseStore();
  
  // --- 筛选状态 ---
  const selectedFaculty = ref<string | undefined>(undefined);
  const selectedCourseName = ref<number | undefined>(undefined); // 存储课程ID，因为课程名可能不唯一
  
  // --- 下拉框选项 ---
  const facultyOptions = ref<{ label: string; value: string }[]>([]);
  const courseNameOptions = ref<CourseInfo[]>([]); // 直接使用 CourseInfo，方便后续使用
  const courseNameLoading = ref(false);
  
  // --- 从 Store 获取所有课程数据用于生成选项 ---
  const allCoursesFlat = computed(() => {
    const courses: CourseInfo[] = [];
    Object.values(courseStore.courseData).forEach(buildingsInDivision => {
      buildingsInDivision.forEach(building => {
        courses.push(...building.infos);
      });
    });
    return courses;
  });
  
  // --- 生成学院选项 ---
  onMounted(() => {
    // 假设 courseStore.courseData 已经或即将被 fetchCourseData填充
    // 如果数据加载是异步的，可能需要 watch courseStore.isLoading
    watch(() => courseStore.isLoading, (loading) => {
      if (!loading && allCoursesFlat.value.length > 0) {
        const faculties = new Set<string>();
        allCoursesFlat.value.forEach(course => {
          if (course.faculty) {
            faculties.add(course.faculty);
          }
        });
        facultyOptions.value = Array.from(faculties).sort().map(f => ({ label: f, value: f }));
      }
    }, { immediate: true });
  
    // 如果 courseData 已经存在，则立即生成
     if (!courseStore.isLoading && allCoursesFlat.value.length > 0) {
        const faculties = new Set<string>();
        allCoursesFlat.value.forEach(course => {
          if (course.faculty) {
            faculties.add(course.faculty);
          }
        });
        facultyOptions.value = Array.from(faculties).sort().map(f => ({ label: f, value: f }));
      }
  
  });
  
  
  // --- 联动：学院变化时更新课程名选项 ---
  watch(selectedFaculty, (newFaculty) => {
    selectedCourseName.value = undefined; // 清空已选课程
    courseNameOptions.value = [];
    if (newFaculty) {
      courseNameLoading.value = true;
      // 模拟异步获取或直接从 allCoursesFlat 筛选
      setTimeout(() => { // 模拟异步
        courseNameOptions.value = allCoursesFlat.value.filter(
          course => course.faculty === newFaculty
        ).sort((a, b) => a.courseName.localeCompare(b.courseName));
        courseNameLoading.value = false;
      }, 300);
    }
  });
  
  // --- 课程名远程搜索 (如果需要，或者直接用 filterable) ---
  const searchCourseNames = (query: string) => {
    if (query) {
      courseNameLoading.value = true;
      setTimeout(() => { // 模拟异步
        const baseCourses = selectedFaculty.value
          ? allCoursesFlat.value.filter(c => c.faculty === selectedFaculty.value)
          : allCoursesFlat.value; // 如果未选学院，则在所有课程中搜索（或者禁用此行为）
  
        courseNameOptions.value = baseCourses.filter(course =>
          course.courseName.toLowerCase().includes(query.toLowerCase())
        ).sort((a, b) => a.courseName.localeCompare(b.courseName));
        courseNameLoading.value = false;
      }, 300);
    } else {
      // 如果查询为空，恢复基于已选学院的列表 (如果已选学院)
      if (selectedFaculty.value) {
          courseNameOptions.value = allCoursesFlat.value.filter(
              course => course.faculty === selectedFaculty.value
          ).sort((a, b) => a.courseName.localeCompare(b.courseName));
      } else {
          courseNameOptions.value = []; // 或者显示所有课程的前 N 个作为提示
      }
    }
  };
  
  const handleFacultyChange = () => {
    // selectedCourseName 和 courseNameOptions 已在 watch 中处理
    // 触发一次筛选，或让用户点击按钮
    // emitFilters(); // 如果希望选择后立即筛选
  };
  
  const handleFacultyClear = () => {
    selectedFaculty.value = undefined;
    selectedCourseName.value = undefined;
    courseNameOptions.value = [];
    // emitFilters();
  };
  
  const handleCourseNameChange = () => {
    // emitFilters();
  };
  
  const handleCourseNameClear = () => {
    selectedCourseName.value = undefined;
    // emitFilters();
  };
  
  
  // --- 定义 emit，通知父组件筛选条件已改变 ---
  const emit = defineEmits(['filter-changed']);
  
  const applyFilters = () => {
    emit('filter-changed', {
      faculty: selectedFaculty.value,
      courseId: selectedCourseName.value, // 注意这里传递的是课程ID (number | undefined)
    });
  };
  
  </script>
  
  <style scoped>
  .course-filter-container {
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  /* 可以添加更多样式 */
  </style>