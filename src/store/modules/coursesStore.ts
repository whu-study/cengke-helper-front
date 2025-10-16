import { defineStore } from 'pinia';
import {
    getCourseList,
    submitCourseReview as apiSubmitCourseReview,
    getCourseReviews as apiGetCourseReviews,
    getCourseDetail as apiGetCourseDetail
} from '@/api/courseService';
// 课程信息接口，现在只依赖 course.ts 中的定义
import type {
    BuildingInfo,
    CourseInfo,
    CourseReviewInfo as CourseReview,
    CourseReviewPayload,
    CourseDetail
} from '@/types/course'; // 使用 CourseReviewInfo as CourseReview, 并导入 CourseDetail
import { ref, computed } from 'vue';
import { generateNewMockData, convertNewDataToOldFormat } from '@/utils/newMockData';

export const useCourseStore = defineStore('course', () => {
    // state
    const courseData = ref<BuildingInfo[][]>([[], [], [], []]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const _currentDivision = ref(0);

    const currentCourseInfo = ref<CourseInfo | null>(null); // 直接使用 CourseInfo | null
    const currentCourseDetail = ref<CourseDetail | null>(null);
    const currentCourseReviews = ref<CourseReview[]>([]); // 类型来自 course.ts (CourseReviewInfo as CourseReview)
    const isDetailLoading = ref(false);
    const reviewsLoading = ref(false);
    const allCoursesFlatList = ref<CourseInfo[]>([]); // 扁平化的所有课程列表
    const filteredCourses = ref<CourseInfo[]>([]);    // 筛选后的课程列表
    const currentFacultyFilter = ref<string | null>(null);
    const currentCourseIdFilter = ref<number | null>(null); // 按课程ID筛选
    // getters
    const currentDivision = computed(() => _currentDivision.value);
    const selectedCourseId = computed(() => currentCourseInfo.value?.id || null);
    // --- Getter: 扁平化所有课程 (用于筛选) ---
    // 这个可以在 fetchCourseData 成功后填充
    function populateAllCoursesFlatList() {
        const courses: CourseInfo[] = [];
        courseData.value.forEach((buildingsInDivision: BuildingInfo[]) => {
            buildingsInDivision.forEach((building: BuildingInfo) => {
                courses.push(...building.infos);
            });
        });
        // 去重（如果课程可能在多处出现且ID相同）
        const uniqueCourses = new Map<number, CourseInfo>();
        courses.forEach(course => {
            if (!uniqueCourses.has(course.id)) {
                uniqueCourses.set(course.id, course);
            }
        });
        allCoursesFlatList.value = Array.from(uniqueCourses.values());
        applyCourseFilters(); // 初始加载数据后也应用一次筛选（可能没有筛选条件，显示全部）
    }

    // 导入新的Mock数据生成器
    function generateMockData() {
        // 使用新的数据结构生成Mock数据并转换为旧格式
        const newData = generateNewMockData();
        return convertNewDataToOldFormat(newData);
    }

    // actions (普通函数)
    async function fetchCourseData() { // 将方法改为 async/await 以便更清晰地处理异步操作
        isLoading.value = true;
        error.value = null; // 重置错误状态

        // // 使用Mock数据进行演示
        // console.log('使用新的Mock数据结构进行演示...');

        // try {
        //     // 模拟网络延迟
        //     await new Promise(resolve => setTimeout(resolve, 500));

        //     // 使用新的mock数据结构
        //     const mockData = generateMockData();
        //     courseData.value = mockData;

        //     console.log('新Mock数据加载完成:', courseData.value);
        //     populateAllCoursesFlatList(); // 获取数据后填充扁平列表并应用初始筛选
        // } catch (err: any) {
        //     console.error('Mock数据加载失败:', err);
        //     error.value = err.message || '获取课程信息失败';
        // } finally {
        //     isLoading.value = false;
        // }

        // 如果你想要尝试真实API，可以注释掉上面的mock代码，启用下面的真实API调用
        try {
            const res = await getCourseList(); // 使用 await 等待异步操作完成

            // 校验 API 返回码
            if (res.code !== 0) {
                throw new Error(`API Error: ${res.msg}${res.code}`);
            }

            // 校验数据结构
            if (!Array.isArray(res.data)) {
                throw new Error('Invalid data structure');
            }

            // 处理数据更新
            res.data.forEach((division: BuildingInfo[], index: number) => {
                if (index in courseData.value) {
                    courseData.value[index] = division;
                }
            });
            console.log(courseData.value);
            populateAllCoursesFlatList(); // 获取数据后填充扁平列表并应用初始筛选
        } catch (err: any) { // 更明确地捕获错误类型
            console.error('请求失败:', err);
            error.value = err.message || '获取课程信息失败';
        } finally {
            isLoading.value = false;
        }
    }

    // --- Action: 应用筛选 ---
    function applyCourseFilters(filters?: { faculty?: string | null, courseId?: number | null }) {
        console.log(filters)
        if (filters) {
            currentFacultyFilter.value = !filters.faculty ? null : filters.faculty;
            currentCourseIdFilter.value = !filters.courseId ? null : filters.courseId;

        }
        console.log(currentFacultyFilter.value);
        console.log(currentCourseIdFilter.value)

        let result = [...allCoursesFlatList.value];

        if (currentFacultyFilter.value) {
            result = result.filter(course => course.faculty === currentFacultyFilter.value);
        }

        if (currentCourseIdFilter.value) { // 如果是按课程ID筛选 (课程名下拉框选中的是课程ID)
            result = result.filter(course => course.id === currentCourseIdFilter.value);
        }
        // 如果课程名筛选是基于文本输入而不是ID，则需要不同的逻辑
        // else if (currentCourseNameFilter.value) { // 假设还有个 currentCourseNameFilter
        //    result = result.filter(course =>
        //        course.courseName.toLowerCase().includes(currentCourseNameFilter.value!.toLowerCase())
        //    );
        // }

        filteredCourses.value = result;
    }

    // --- Action: 清除筛选 ---
    function clearCourseFilters() {
        currentFacultyFilter.value = null;
        currentCourseIdFilter.value = null;
        applyCourseFilters(); // 应用筛选会重置为显示所有
    }

    // --- Getter: 筛选后的课程列表 (在组件中直接使用 filteredCourses 这个 ref) ---
    // const displayedCourses = computed(() => filteredCourses.value); // 或者直接用 filteredCourses

    // --- Getter: 用于下拉框的学院选项 ---
    const facultyOptionsForFilter = computed(() => {
        const faculties = new Set<string>();
        allCoursesFlatList.value.forEach(course => {
            if (course.faculty) faculties.add(course.faculty);
        });
        return Array.from(faculties).sort().map(f => ({ label: f, value: f }));
    });

    // --- Getter: 根据已选学院动态生成课程名选项 (用于二级下拉框) ---
    const courseNameOptionsForFilter = computed(() => {
        if (!currentFacultyFilter.value) {
            // 如果未选择学院，可以返回空，或者返回该学院下所有课程，或者禁用课程名选择
            return allCoursesFlatList.value // 或者 []，取决于交互设计
                .sort((a, b) => a.courseName.localeCompare(b.courseName))
                .map(c => ({ id: c.id, courseName: c.courseName, faculty: c.faculty }));
        }
        return allCoursesFlatList.value
            .filter(course => course.faculty === currentFacultyFilter.value)
            .sort((a, b) => a.courseName.localeCompare(b.courseName))
            .map(c => ({ id: c.id, courseName: c.courseName, faculty: c.faculty })); // 返回包含ID的对象
    });

    function getBuildingsByDivision(divisionIndex: number): BuildingInfo[] {
        return courseData.value[divisionIndex] || [];
    }

    function setCurrentDivision(divisionIndex: number) {
        _currentDivision.value = divisionIndex;
    }

    function setCurrentCourseInfo(courseInfo: CourseInfo | null) { // 参数类型为 CourseInfo | null
        currentCourseInfo.value = courseInfo;
        currentCourseDetail.value = null;
        currentCourseReviews.value = [];
        if (courseInfo && courseInfo.id) {
            fetchCourseDetailById(courseInfo.id);
            fetchCourseReviews(courseInfo.id);
        }
    }

    async function fetchCourseDetailById(courseId: number) { // courseId 类型根据 CourseInfo.id 确定为 number
        isDetailLoading.value = true;
        error.value = null;
        try {
            const res = await apiGetCourseDetail(courseId);
            if (res.code === 0) {
                currentCourseDetail.value = res.data as CourseDetail;
            } else {
                throw new Error(res.msg || `获取课程详情失败 (ID: ${courseId})`);
            }
        } catch (err: any) {
            console.error('获取课程详情失败:', err);
            error.value = err.message;
            currentCourseDetail.value = null;
        } finally {
            isDetailLoading.value = false;
        }
    }

    async function fetchCourseReviews(courseId: number) { // courseId 类型根据 CourseInfo.id 确定为 number
        reviewsLoading.value = true;
        error.value = null;
        try {
            const res = await apiGetCourseReviews(courseId);
            if (res.code === 0 && Array.isArray(res.data)) {
                currentCourseReviews.value = res.data as CourseReview[];
            } else {
                throw new Error(res.msg || `获取课程评价列表失败 (ID: ${courseId})`);
            }
        } catch (err: any) {
            console.error('获取课程评价列表失败:', err);
            error.value = err.message;
            currentCourseReviews.value = [];
        } finally {
            reviewsLoading.value = false;
        }
    }

    async function submitCourseReview(payload: CourseReviewPayload): Promise<boolean> { // 返回 Promise<boolean>
        error.value = null;
        try {
            // 确保 payload.courseId 是 number 类型，如果后端需要
            const submissionPayload = { ...payload, courseId: Number(payload.courseId) };
            const res = await apiSubmitCourseReview(submissionPayload);
            if (res.code === 0) {
                if (submissionPayload.courseId) {
                    await fetchCourseReviews(submissionPayload.courseId);
                }
                return true;
            } else {
                throw new Error(res.msg || '提交评价失败');
            }
        } catch (err: any) {
            console.error('提交评价失败:', err);
            error.value = err.message;
            return false;
        }
    }

    return {
        courseData,
        isLoading,
        error,
        _currentDivision,
        currentCourseInfo,
        currentCourseDetail,
        currentCourseReviews,
        isDetailLoading,
        reviewsLoading,
        currentDivision,
        selectedCourseId,
        fetchCourseData,
        getBuildingsByDivision,
        setCurrentDivision,
        setCurrentCourseInfo,
        fetchCourseDetailById,
        fetchCourseReviews,
        submitCourseReview,
        applyCourseFilters,
        clearCourseFilters,
        facultyOptionsForFilter,
        courseNameOptionsForFilter,
        filteredCourses,
        allCoursesFlatList
    };
});