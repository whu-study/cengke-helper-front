import { defineStore } from 'pinia';
import {
    getCourseList,
    submitCourseReview as apiSubmitCourseReview,
    getCourseReviews as apiGetCourseReviews,
    getCourseDetail as apiGetCourseDetail,
    getCurrentTime as apiGetCurrentTime,
    type CourseQueryParams
} from '@/api/courseService';
// 课程信息接口，现在只依赖 course.ts 中的定义
import type {
    BuildingInfo,
    CourseInfo,
    CourseReviewInfo as CourseReview,
    CourseReviewPayload,
    CourseDetail,
    CurrentTimeInfo
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

    // 当前时间信息
    const currentTimeInfo = ref<CurrentTimeInfo | null>(null);
    const isTimeLoading = ref(false);

    // 时间查询参数 - 用于用户自定义查看特定时间的课程
    const selectedTimeQuery = ref<CourseQueryParams | null>(null);
    const isUsingCustomTime = ref(false); // 是否使用自定义时间查询
    const hasAttemptedFetch = ref(false); // 是否已经尝试过获取数据（防止无限重复请求）
    // getters
    const currentDivision = computed(() => _currentDivision.value);
    const selectedCourseId = computed(() => currentCourseInfo.value?.id || null);
    // --- Getter: 扁平化所有课程 (用于筛选) ---
    // 这个可以在 fetchCourseData 成功后填充
    function populateAllCoursesFlatList() {
        const courses: CourseInfo[] = [];
        console.log('courseData.value structure:', courseData.value);

        // 确保courseData.value是数组
        if (!Array.isArray(courseData.value)) {
            console.error('courseData.value is not an array:', courseData.value);
            allCoursesFlatList.value = [];
            filteredCourses.value = [];
            return;
        }

        courseData.value.forEach((buildingsInDivision: BuildingInfo[], divisionIndex: number) => {
            console.log(`Division ${divisionIndex}:`, buildingsInDivision);

            if (Array.isArray(buildingsInDivision)) {
                buildingsInDivision.forEach((building: BuildingInfo) => {
                    if (building && building.infos && Array.isArray(building.infos)) {
                        courses.push(...building.infos);
                    }
                });
            } else {
                console.error(`Division ${divisionIndex} is not an array:`, buildingsInDivision);
            }
        });
        // 统计重复课程
        const courseCountMap = new Map<string, number>();
        courses.forEach(course => {
            const courseKey = `${course.courseName}-${course.teacherName}-${course.faculty}`;
            courseCountMap.set(courseKey, (courseCountMap.get(courseKey) || 0) + 1);
        });

        // 输出重复课程信息
        console.log('Course duplication analysis:');
        courseCountMap.forEach((count, key) => {
            if (count > 1) {
                console.log(`Duplicate course found: ${key} appears ${count} times`);
            }
        });

        // 去重逻辑：基于课程名+教师名+学院去重，但保留不同教室信息为数组而不直接拼接字符串
        const uniqueCourses = new Map<string, CourseInfo & { rooms?: string[] }>();
        courses.forEach(course => {
            const uniqueKey = `${course.courseName}-${course.teacherName}-${course.faculty}`;
            if (!uniqueCourses.has(uniqueKey)) {
                // 初始化时保留原始 room 并创建 rooms 数组
                const copy: CourseInfo & { rooms?: string[] } = { ...course };
                copy.rooms = copy.rooms || (copy.room ? [copy.room] : []);
                uniqueCourses.set(uniqueKey, copy);
            } else {
                const existingCourse = uniqueCourses.get(uniqueKey)!;
                console.log(`Merging duplicate course: ${course.courseName} by ${course.teacherName}`);
                // 合并 rooms 数组，去重
                existingCourse.rooms = existingCourse.rooms || (existingCourse.room ? [existingCourse.room] : []);
                if (course.room && !existingCourse.rooms.includes(course.room)) {
                    existingCourse.rooms.push(course.room);
                }
                // 保留第一条 courseTime（避免显示过长串），如果需要可在UI上展示所有时间
                if (!existingCourse.courseTime && course.courseTime) {
                    existingCourse.courseTime = course.courseTime;
                }
            }
        });

        // 把 rooms 数组转换为前端可显示的格式（保留 room 字段为首个教室）
        allCoursesFlatList.value = Array.from(uniqueCourses.values()).map(c => {
            // ensure room is the first room
            const copy = { ...c } as CourseInfo & { rooms?: string[] };
            if (copy.rooms && copy.rooms.length > 0) {
                copy.room = copy.rooms[0];
            }
            return copy;
        });
        console.log('All courses flat list after deduplication:', allCoursesFlatList.value);
        console.log(`Total courses after deduplication: ${allCoursesFlatList.value.length}`);

        applyCourseFilters(); // 初始加载数据后也应用一次筛选（可能没有筛选条件，显示全部）
    }

    // 格式化时间段的辅助函数
    function formatTimeSlots(timeSlots: any[]): string {
        console.log('formatTimeSlots 输入参数:', timeSlots);

        if (!timeSlots) {
            console.log('timeSlots 为 null 或 undefined');
            return '';
        }

        if (!Array.isArray(timeSlots)) {
            console.log('timeSlots 不是数组类型:', typeof timeSlots);
            return '';
        }

        if (timeSlots.length === 0) {
            console.log('timeSlots 是空数组');
            return '';
        }

        const dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

        const result = timeSlots.map(slot => {
            console.log('处理时间段:', slot);
            if (!slot || typeof slot.dayOfWeek === 'undefined' || typeof slot.startPeriod === 'undefined' || typeof slot.endPeriod === 'undefined') {
                console.log('⚠️  时间段数据不完整:', slot);
                return '时间待定';
            }
            return `${dayNames[slot.dayOfWeek]} ${slot.startPeriod}-${slot.endPeriod}节`;
        }).join(' ');

        console.log('formatTimeSlots 结果:', result);
        return result;
    }

    // 改进的Mock数据生成器 - 包含正确的楼层信息
    // function generateMockData(): BuildingInfo[][] {
    //     const mockBuildings: BuildingInfo[][] = [
    //         // 文理学部 (0)
    //         [
    //             {
    //                 building: '文理学部教学楼A',
    //                 label: '文理学部教学楼A',
    //                 value: 0,
    //                 // 添加floors属性用于新的楼层导航
    //                 floors: [
    //                     {
    //                         floorName: 'A楼1层',
    //                         floorNumber: 1,
    //                         rooms: ['A101', 'A102', 'A103', 'A104'],
    //                         courses: [
    //                             {
    //                                 id: 1,
    //                                 room: 'A101',
    //                                 faculty: '数学与统计学院',
    //                                 courseName: '高等数学A(1)',
    //                                 teacherName: '张教授',
    //                                 teacherTitle: '教授',
    //                                 courseTime: '周一 1-2节',
    //                                 courseType: '必修课'
    //                             },
    //                             {
    //                                 id: 2,
    //                                 room: 'A103',
    //                                 faculty: '物理科学与技术学院',
    //                                 courseName: '大学物理',
    //                                 teacherName: '李教授',
    //                                 teacherTitle: '副教授',
    //                                 courseTime: '周二 3-4节',
    //                                 courseType: '必修课'
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         floorName: 'A楼2层',
    //                         floorNumber: 2,
    //                         rooms: ['A201', 'A202', 'A203', 'A204'],
    //                         courses: [
    //                             {
    //                                 id: 3,
    //                                 room: 'A201',
    //                                 faculty: '化学与分子科学学院',
    //                                 courseName: '无机化学',
    //                                 teacherName: '王教授',
    //                                 teacherTitle: '教授',
    //                                 courseTime: '周三 1-2节',
    //                                 courseType: '专业课'
    //                             },
    //                             {
    //                                 id: 16,
    //                                 room: 'A202',
    //                                 faculty: '数学与统计学院',
    //                                 courseName: '线性代数',
    //                                 teacherName: '陈教授',
    //                                 teacherTitle: '副教授',
    //                                 courseTime: '周四 3-4节',
    //                                 courseType: '必修课'
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         floorName: 'A楼3层',
    //                         floorNumber: 3,
    //                         rooms: ['A301', 'A302', 'A303'],
    //                         courses: [
    //                             {
    //                                 id: 17,
    //                                 room: 'A301',
    //                                 faculty: '物理科学与技术学院',
    //                                 courseName: '理论力学',
    //                                 teacherName: '刘教授',
    //                                 teacherTitle: '教授',
    //                                 courseTime: '周五 1-2节',
    //                                 courseType: '专业课'
    //                             }
    //                         ]
    //                     }
    //                 ],
    //                 // 保持兼容性的infos字段 - 扁平化所有课程
    //                 infos: [
    //                     {
    //                         id: 1,
    //                         room: 'A101',
    //                         faculty: '数学与统计学院',
    //                         courseName: '高等数学A(1)',
    //                         teacherName: '张教授',
    //                         teacherTitle: '教授',
    //                         courseTime: '周一 1-2节',
    //                         courseType: '必修课'
    //                     },
    //                     {
    //                         id: 2,
    //                         room: 'A103',
    //                         faculty: '物理科学与技术学院',
    //                         courseName: '大学物理',
    //                         teacherName: '李教授',
    //                         teacherTitle: '副教授',
    //                         courseTime: '周二 3-4节',
    //                         courseType: '必修课'
    //                     },
    //                     {
    //                         id: 3,
    //                         room: 'A201',
    //                         faculty: '化学与分子科学学院',
    //                         courseName: '无机化学',
    //                         teacherName: '王教授',
    //                         teacherTitle: '教授',
    //                         courseTime: '周三 1-2节',
    //                         courseType: '专业课'
    //                     },
    //                     {
    //                         id: 16,
    //                         room: 'A202',
    //                         faculty: '数学与统计学院',
    //                         courseName: '线性代数',
    //                         teacherName: '陈教授',
    //                         teacherTitle: '副教授',
    //                         courseTime: '周四 3-4节',
    //                         courseType: '必修课'
    //                     },
    //                     {
    //                         id: 17,
    //                         room: 'A301',
    //                         faculty: '物理科学与技术学院',
    //                         courseName: '理论力学',
    //                         teacherName: '刘教授',
    //                         teacherTitle: '教授',
    //                         courseTime: '周五 1-2节',
    //                         courseType: '专业课'
    //                     }
    //                 ]
    //             },
    //             {
    //                 building: '文理学部教学楼B',
    //                 label: '文理学部教学楼B',
    //                 value: 1,
    //                 floors: [
    //                     {
    //                         floorName: 'B楼1层',
    //                         floorNumber: 1,
    //                         rooms: ['B101', 'B102'],
    //                         courses: [
    //                             {
    //                                 id: 4,
    //                                 room: 'B101',
    //                                 faculty: '文学院',
    //                                 courseName: '中国古代文学',
    //                                 teacherName: '赵教授',
    //                                 teacherTitle: '教授',
    //                                 courseTime: '周四 5-6节',
    //                                 courseType: '专业课'
    //                             },
    //                             {
    //                                 id: 5,
    //                                 room: 'B102',
    //                                 faculty: '外国语言文学学院',
    //                                 courseName: '英语精读',
    //                                 teacherName: '刘教授',
    //                                 teacherTitle: '副教授',
    //                                 courseTime: '周五 1-2节',
    //                                 courseType: '通识课'
    //                             }
    //                         ]
    //                     }
    //                 ],
    //                 infos: [
    //                     {
    //                         id: 4,
    //                         room: 'B101',
    //                         faculty: '文学院',
    //                         courseName: '中国古代文学',
    //                         teacherName: '赵教授',
    //                         teacherTitle: '教授',
    //                         courseTime: '周四 5-6节',
    //                         courseType: '专业课'
    //                     },
    //                     {
    //                         id: 5,
    //                         room: 'B102',
    //                         faculty: '外国语言文学学院',
    //                         courseName: '英语精读',
    //                         teacherName: '刘教授',
    //                         teacherTitle: '副教授',
    //                         courseTime: '周五 1-2节',
    //                         courseType: '通识课'
    //                     }
    //                 ]
    //             }
    //         ],
    //         // 工学部 (1)  
    //         [
    //             {
    //                 building: '工学部主楼',
    //                 label: '工学部主楼',
    //                 value: 0,
    //                 floors: [
    //                     {
    //                         floorName: 'C楼3层',
    //                         floorNumber: 3,
    //                         rooms: ['C301', 'C302'],
    //                         courses: [
    //                             {
    //                                 id: 6,
    //                                 room: 'C301',
    //                                 faculty: '土木建筑工程学院',
    //                                 courseName: '结构力学',
    //                                 teacherName: '陈教授',
    //                                 teacherTitle: '教授',
    //                                 courseTime: '周一 3-4节',
    //                                 courseType: '专业课'
    //                             },
    //                             {
    //                                 id: 7,
    //                                 room: 'C302',
    //                                 faculty: '机械与动力工程学院',
    //                                 courseName: '机械设计',
    //                                 teacherName: '孙教授',
    //                                 teacherTitle: '副教授',
    //                                 courseTime: '周二 5-6节',
    //                                 courseType: '专业课'
    //                             }
    //                         ]
    //                     }
    //                 ],
    //                 infos: [
    //                     {
    //                         id: 6,
    //                         room: 'C301',
    //                         faculty: '土木建筑工程学院',
    //                         courseName: '结构力学',
    //                         teacherName: '陈教授',
    //                         teacherTitle: '教授',
    //                         courseTime: '周一 3-4节',
    //                         courseType: '专业课'
    //                     },
    //                     {
    //                         id: 7,
    //                         room: 'C302',
    //                         faculty: '机械与动力工程学院',
    //                         courseName: '机械设计',
    //                         teacherName: '孙教授',
    //                         teacherTitle: '副教授',
    //                         courseTime: '周二 5-6节',
    //                         courseType: '专业课'
    //                     }
    //                 ]
    //             }
    //         ],
    //         // 信息学部 (2)
    //         [
    //             {
    //                 building: '信息学部计算机楼',
    //                 label: '信息学部计算机楼',
    //                 value: 0,
    //                 floors: [
    //                     {
    //                         floorName: 'E楼5层',
    //                         floorNumber: 5,
    //                         rooms: ['E501', 'E502', 'E503'],
    //                         courses: [
    //                             {
    //                                 id: 9,
    //                                 room: 'E501',
    //                                 faculty: '计算机学院',
    //                                 courseName: '数据结构与算法',
    //                                 teacherName: '吴教授',
    //                                 teacherTitle: '教授',
    //                                 courseTime: '周一 5-6节',
    //                                 courseType: '专业课'
    //                             }
    //                         ]
    //                     }
    //                 ],
    //                 infos: [
    //                     {
    //                         id: 9,
    //                         room: 'E501',
    //                         faculty: '计算机学院',
    //                         courseName: '数据结构与算法',
    //                         teacherName: '吴教授',
    //                         teacherTitle: '教授',
    //                         courseTime: '周一 5-6节',
    //                         courseType: '专业课'
    //                     }
    //                 ]
    //             }
    //         ],
    //         // 医学部 (3)
    //         [
    //             {
    //                 building: '医学部教学楼',
    //                 label: '医学部教学楼',
    //                 value: 0,
    //                 floors: [
    //                     {
    //                         floorName: 'G楼7层',
    //                         floorNumber: 7,
    //                         rooms: ['G701'],
    //                         courses: [
    //                             {
    //                                 id: 13,
    //                                 room: 'G701',
    //                                 faculty: '基础医学院',
    //                                 courseName: '人体解剖学',
    //                                 teacherName: '朱教授',
    //                                 teacherTitle: '教授',
    //                                 courseTime: '周一 7-8节',
    //                                 courseType: '专业课'
    //                             }
    //                         ]
    //                     }
    //                 ],
    //                 infos: [
    //                     {
    //                         id: 13,
    //                         room: 'G701',
    //                         faculty: '基础医学院',
    //                         courseName: '人体解剖学',
    //                         teacherName: '朱教授',
    //                         teacherTitle: '教授',
    //                         courseTime: '周一 7-8节',
    //                         courseType: '专业课'
    //                     }
    //                 ]
    //             }
    //         ]
    //     ];

    //     console.log('Generated improved mock data with floors:', mockBuildings);
    //     return mockBuildings;
    // }

    // actions (普通函数)
    async function fetchCourseData(queryParams?: CourseQueryParams, forceRefresh = false) {
        // 防止重复请求
        if (isLoading.value) {
            console.log('fetchCourseData: 已有请求正在进行中，跳过重复请求');
            return;
        }

        // 如果数据已存在且不是强制刷新，也跳过请求（除非有查询参数）
        if (!forceRefresh && !queryParams && allCoursesFlatList.value.length > 0) {
            console.log('fetchCourseData: 数据已存在，跳过请求');
            return;
        }

        // 如果没有查询参数且已经尝试过获取数据，避免无限重复请求
        if (!queryParams && !forceRefresh && hasAttemptedFetch.value) {
            console.log('fetchCourseData: 已经尝试过获取数据，避免重复请求');
            return;
        }

        isLoading.value = true;
        error.value = null; // 重置错误状态

        // 使用真实API获取课程数据
        console.log('fetchCourseData: 开始获取课程数据...', queryParams ? `查询参数: ${JSON.stringify(queryParams)}` : '默认查询');

        try {
            const res = await getCourseList(queryParams); // 传递查询参数

            // 校验 API 返回码
            if (res.code !== 0) {
                throw new Error(`API Error: ${res.msg}${res.code}`);
            }

            // 校验数据结构
            if (!Array.isArray(res.data)) {
                throw new Error('Invalid data structure');
            }

            console.log('API返回的新格式数据:', res.data);

            // 检查第一个课程的timeSlots数据格式（使用any类型绕过类型检查）
            if (res.data.length > 0) {
                const firstDivision = res.data[0] as any;
                console.log('第一个学部数据:', firstDivision);

                if (firstDivision.buildings && firstDivision.buildings.length > 0) {
                    const firstBuilding = firstDivision.buildings[0] as any;
                    console.log('第一个教学楼数据:', firstBuilding);

                    if (firstBuilding.floors && firstBuilding.floors.length > 0) {
                        const firstFloor = firstBuilding.floors[0] as any;
                        console.log('第一个楼层数据:', firstFloor);

                        if (firstFloor.courses && firstFloor.courses.length > 0) {
                            const sampleCourse = firstFloor.courses[0] as any;
                            console.log('样例课程数据:', sampleCourse);
                            console.log('timeSlots字段类型:', typeof sampleCourse.timeSlots);
                            console.log('timeSlots字段值:', sampleCourse.timeSlots);
                            console.log('timeSlots是否为数组:', Array.isArray(sampleCourse.timeSlots));
                            if (sampleCourse.timeSlots) {
                                console.log('formatTimeSlots结果:', formatTimeSlots(sampleCourse.timeSlots));
                            } else {
                                console.log('⚠️  timeSlots字段不存在或为空');
                            }
                        } else {
                            console.log('⚠️  楼层中没有课程数据');
                        }
                    } else {
                        console.log('⚠️  教学楼中没有楼层数据');
                    }
                } else {
                    console.log('⚠️  学部中没有教学楼数据');
                }
            } else {
                console.log('⚠️  API返回的数据为空');
            }

            // 将新的API格式转换为旧的数据结构以保持兼容性
            const convertedData: BuildingInfo[][] = res.data.map((division: any) => {
                // 如果学部没有buildings或buildings为空，返回空数组
                if (!division.buildings || !Array.isArray(division.buildings) || division.buildings.length === 0) {
                    console.log('学部没有教学楼数据:', division.divisionName || 'Unknown Division');
                    return [];
                }

                return division.buildings.map((building: any, index: number) => ({
                    building: building.buildingName,
                    label: building.buildingName,
                    value: index,
                    floors: building.floors, // 保留新的floors信息
                    infos: (building.floors || []).flatMap((floor: any) =>
                        (floor.courses || []).map((course: any) => {
                            const formattedTime = formatTimeSlots(course.timeSlots);
                            console.log(`课程 ${course.courseName} - timeSlots:`, course.timeSlots, '-> courseTime:', formattedTime);
                            return {
                                id: course.id,
                                room: course.room,
                                faculty: course.faculty,
                                courseName: course.courseName,
                                teacherName: course.teacherName,
                                teacherTitle: course.teacherTitle,
                                courseTime: formattedTime,
                                courseType: course.courseType
                            };
                        })
                    )
                }));
            });

            // 更新courseData
            courseData.value = convertedData;
            console.log('转换后的数据:', courseData.value);
            populateAllCoursesFlatList(); // 获取数据后填充扁平列表并应用初始筛选

            // 标记已经尝试过获取数据
            hasAttemptedFetch.value = true;
        } catch (err: any) { // 更明确地捕获错误类型
            console.error('请求失败:', err);
            error.value = err.message || '获取课程信息失败';
            // 即使失败也标记为已尝试，避免无限重复请求
            hasAttemptedFetch.value = true;
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
        console.log('getBuildingsByDivision called with index:', divisionIndex);
        console.log('courseData.value:', courseData.value);
        console.log('courseData.value[divisionIndex]:', courseData.value[divisionIndex]);

        // 确保courseData.value存在且是数组
        if (!Array.isArray(courseData.value)) {
            console.error('courseData.value is not an array:', courseData.value);
            return [];
        }

        // 确保索引有效
        if (divisionIndex < 0 || divisionIndex >= courseData.value.length) {
            console.warn(`Division index ${divisionIndex} is out of bounds`);
            return [];
        }

        const division = courseData.value[divisionIndex];

        // 确保该学部的数据是数组
        if (!Array.isArray(division)) {
            console.error(`Division at index ${divisionIndex} is not an array:`, division);
            return [];
        }

        return division;
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

    // 获取当前时间信息
    async function fetchCurrentTime() {
        isTimeLoading.value = true;
        error.value = null;
        try {
            const res = await apiGetCurrentTime();
            if (res.code === 0) {
                currentTimeInfo.value = res.data as CurrentTimeInfo;
                console.log('当前时间信息:', currentTimeInfo.value);
            } else {
                throw new Error(res.msg || '获取当前时间信息失败');
            }
        } catch (err: any) {
            console.error('获取当前时间信息失败:', err);
            error.value = err.message;
            currentTimeInfo.value = null;
        } finally {
            isTimeLoading.value = false;
        }
    }

    // 设置自定义时间查询
    function setCustomTimeQuery(params: CourseQueryParams) {
        selectedTimeQuery.value = params;
        isUsingCustomTime.value = true;
        // 重新获取课程数据时允许重复请求
        hasAttemptedFetch.value = false;
        fetchCourseData(params, true);
    }

    // 回到当前时间
    function resetToCurrentTime() {
        selectedTimeQuery.value = null;
        isUsingCustomTime.value = false;
        // 重新获取当前时间的课程数据时允许重复请求
        hasAttemptedFetch.value = false;
        fetchCourseData(undefined, true);
    }

    // 获取下一节课的课程安排
    async function fetchNextLessonCourses() {
        if (!currentTimeInfo.value) {
            await fetchCurrentTime();
        }

        if (currentTimeInfo.value) {
            let nextLessonNum = currentTimeInfo.value.lessonNum + 1;
            let nextWeekday = currentTimeInfo.value.weekday;
            let nextWeekNum = currentTimeInfo.value.weekNum;

            // 如果超过一天的最大节次（假设最多12节课），跳到下一天第1节
            if (nextLessonNum > 12) {
                nextLessonNum = 1;
                nextWeekday = nextWeekday === 7 ? 1 : nextWeekday + 1;

                // 如果是周一，进入下一周
                if (nextWeekday === 1) {
                    nextWeekNum += 1;
                }
            }

            const nextLessonQuery: CourseQueryParams = {
                weekNum: nextWeekNum,
                weekday: nextWeekday,
                lessonNum: nextLessonNum
            };

            setCustomTimeQuery(nextLessonQuery);
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
        allCoursesFlatList,
        // 当前时间相关
        currentTimeInfo,
        isTimeLoading,
        fetchCurrentTime,
        // 时间查询相关
        selectedTimeQuery,
        isUsingCustomTime,
        hasAttemptedFetch,
        setCustomTimeQuery,
        resetToCurrentTime,
        fetchNextLessonCourses
    };
});