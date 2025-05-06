import { defineStore } from 'pinia';
import { getCourseList } from '@/api/course';
// 课程信息接口
export interface CourseInfo {
    room: string;
    faculty: string;
    courseName: string;
    teacherName: string;
    teacherTitle: string;
    courseTime: string;
    courseType: string;
}

// 教学楼信息接口
export interface BuildingInfo {
    building: string;
    label: string;
    value: number;
    infos: CourseInfo[];
}

// 学部信息接口（假设最外层数组每个元素是一个学部）
interface DivisionInfo {
    [key: number]: BuildingInfo[];
}

export const useCourseStore = defineStore('course', {
    state: () => ({
        courseData: {
            0: [],
            1: [],
            2: [],
            3: []
        } as DivisionInfo,
        isLoading: false,
        error: null as string | null,
        _currentDivision: 0,
    }),
    getters: {
        // 获取当前学部信息的 getter 方法
        currentDivision: (state) => state._currentDivision
    },
    actions: {
         fetchCourseData() {
            this.isLoading = true;
            getCourseList().then((res) => {
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
                    if (index in this.courseData) {
                        this.courseData[index] = division;
                    }
                })
                })
                .catch((error) => {
                    console.error('请求失败:', error);
                    this.error = error.message || '获取课程信息失败';
                })
                .finally(() => {
                    this.isLoading = false;
                })
             console.log(this.courseData);
        },
        getBuildingsByDivision(divisionIndex : number): BuildingInfo[] {
            return this.courseData[divisionIndex] || [];
        },
        // 设置当前学部信息的 setter 方法
        setCurrentDivision(divisionIndex: number) {
            this._currentDivision = divisionIndex;
        }
    }
});