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

    // Mock数据生成函数
    function generateMockData() {
        const mockBuildings: BuildingInfo[][] = [
            // 文理学部 (0)
            [
                {
                    building: '文理学部教学楼A',
                    label: '文理学部教学楼A',
                    value: 0,
                    infos: [
                        {
                            id: 1,
                            room: 'A101',
                            faculty: '数学与统计学院',
                            courseName: '高等数学A(1)',
                            teacherName: '张教授',
                            teacherTitle: '教授',
                            courseTime: '周一 1-2节',
                            courseType: '必修课'
                        },
                        {
                            id: 2,
                            room: 'A103',
                            faculty: '物理科学与技术学院',
                            courseName: '大学物理',
                            teacherName: '李教授',
                            teacherTitle: '副教授',
                            courseTime: '周二 3-4节',
                            courseType: '必修课'
                        },
                        {
                            id: 3,
                            room: 'A201',
                            faculty: '化学与分子科学学院',
                            courseName: '无机化学',
                            teacherName: '王教授',
                            teacherTitle: '教授',
                            courseTime: '周三 1-2节',
                            courseType: '专业课'
                        },
                        {
                            id: 16,
                            room: 'A202',
                            faculty: '数学与统计学院',
                            courseName: '线性代数',
                            teacherName: '陈教授',
                            teacherTitle: '副教授',
                            courseTime: '周四 3-4节',
                            courseType: '必修课'
                        },
                        {
                            id: 17,
                            room: 'A301',
                            faculty: '物理科学与技术学院',
                            courseName: '理论力学',
                            teacherName: '刘教授',
                            teacherTitle: '教授',
                            courseTime: '周五 1-2节',
                            courseType: '专业课'
                        }
                    ]
                },
                {
                    building: '文理学部教学楼B',
                    label: '文理学部教学楼B',
                    value: 1,
                    infos: [
                        {
                            id: 4,
                            room: 'B101',
                            faculty: '文学院',
                            courseName: '中国古代文学',
                            teacherName: '赵教授',
                            teacherTitle: '教授',
                            courseTime: '周四 5-6节',
                            courseType: '专业课'
                        },
                        {
                            id: 5,
                            room: 'B102',
                            faculty: '外国语言文学学院',
                            courseName: '英语精读',
                            teacherName: '刘教授',
                            teacherTitle: '副教授',
                            courseTime: '周五 1-2节',
                            courseType: '通识课'
                        },
                        {
                            id: 18,
                            room: 'B201',
                            faculty: '文学院',
                            courseName: '现代文学',
                            teacherName: '周教授',
                            teacherTitle: '副教授',
                            courseTime: '周一 5-6节',
                            courseType: '专业课'
                        },
                        {
                            id: 19,
                            room: 'B301',
                            faculty: '哲学学院',
                            courseName: '西方哲学史',
                            teacherName: '吴教授',
                            teacherTitle: '教授',
                            courseTime: '周三 3-4节',
                            courseType: '通识课'
                        }
                    ]
                }
            ],
            // 工学部 (1)
            [
                {
                    building: '工学部主楼',
                    label: '工学部主楼',
                    value: 0,
                    infos: [
                        {
                            id: 6,
                            room: 'C301',
                            faculty: '土木建筑工程学院',
                            courseName: '结构力学',
                            teacherName: '陈教授',
                            teacherTitle: '教授',
                            courseTime: '周一 3-4节',
                            courseType: '专业课'
                        },
                        {
                            id: 7,
                            room: 'C302',
                            faculty: '机械与动力工程学院',
                            courseName: '机械设计',
                            teacherName: '孙教授',
                            teacherTitle: '副教授',
                            courseTime: '周二 5-6节',
                            courseType: '专业课'
                        }
                    ]
                },
                {
                    building: '工学部实验楼',
                    label: '工学部实验楼',
                    value: 1,
                    infos: [
                        {
                            id: 8,
                            room: 'D401',
                            faculty: '材料科学与工程学院',
                            courseName: '材料科学基础',
                            teacherName: '周教授',
                            teacherTitle: '教授',
                            courseTime: '周三 3-4节',
                            courseType: '专业课'
                        }
                    ]
                }
            ],
            // 信息学部 (2)
            [
                {
                    building: '信息学部计算机楼',
                    label: '信息学部计算机楼',
                    value: 0,
                    infos: [
                        {
                            id: 9,
                            room: 'E501',
                            faculty: '计算机学院',
                            courseName: '数据结构与算法',
                            teacherName: '吴教授',
                            teacherTitle: '教授',
                            courseTime: '周一 5-6节',
                            courseType: '专业课'
                        },
                        {
                            id: 10,
                            room: 'E502',
                            faculty: '软件工程学院',
                            courseName: '软件工程',
                            teacherName: '郑教授',
                            teacherTitle: '副教授',
                            courseTime: '周二 1-2节',
                            courseType: '专业课'
                        },
                        {
                            id: 11,
                            room: 'E503',
                            faculty: '网络空间安全学院',
                            courseName: '计算机网络',
                            teacherName: '黄教授',
                            teacherTitle: '教授',
                            courseTime: '周四 3-4节',
                            courseType: '专业课'
                        }
                    ]
                },
                {
                    building: '信息学部电子楼',
                    label: '信息学部电子楼',
                    value: 1,
                    infos: [
                        {
                            id: 12,
                            room: 'F601',
                            faculty: '电子信息学院',
                            courseName: '数字信号处理',
                            teacherName: '徐教授',
                            teacherTitle: '副教授',
                            courseTime: '周五 3-4节',
                            courseType: '专业课'
                        }
                    ]
                }
            ],
            // 医学部 (3)
            [
                {
                    building: '医学部教学楼',
                    label: '医学部教学楼',
                    value: 0,
                    infos: [
                        {
                            id: 13,
                            room: 'G701',
                            faculty: '基础医学院',
                            courseName: '人体解剖学',
                            teacherName: '朱教授',
                            teacherTitle: '教授',
                            courseTime: '周一 7-8节',
                            courseType: '专业课'
                        },
                        {
                            id: 14,
                            room: 'G702',
                            faculty: '临床医学院',
                            courseName: '内科学',
                            teacherName: '马教授',
                            teacherTitle: '主任医师',
                            courseTime: '周三 5-6节',
                            courseType: '专业课'
                        }
                    ]
                },
                {
                    building: '医学部实验楼',
                    label: '医学部实验楼',
                    value: 1,
                    infos: [
                        {
                            id: 15,
                            room: 'H801',
                            faculty: '药学院',
                            courseName: '药理学',
                            teacherName: '沈教授',
                            teacherTitle: '教授',
                            courseTime: '周四 1-2节',
                            courseType: '专业课'
                        }
                    ]
                }
            ]
        ];

        return mockBuildings;
    }

    // actions (普通函数)
    async function fetchCourseData() { // 将方法改为 async/await 以便更清晰地处理异步操作
        isLoading.value = true;
        error.value = null; // 重置错误状态

        // 使用Mock数据进行演示
        console.log('使用Mock数据进行演示...');

        // try {
        //     // 模拟网络延迟
        //     await new Promise(resolve => setTimeout(resolve, 500));

        //     // 使用mock数据
        //     const mockData = generateMockData();
        //     courseData.value = mockData;

        //     console.log('Mock数据加载完成:', courseData.value);
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