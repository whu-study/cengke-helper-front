import type { UserProfile } from '@/types/user';

export interface CourseInfo {
    id: number;
    room: string;
    faculty: string;
    courseName: string;
    teacherName: string;
    teacherTitle: string;
    courseTime: string;
    courseType: string;
}

// 楼层信息接口
export interface FloorInfo {
    floorName: string;
    floorNumber: number;
    rooms: string[];
    courses: CourseInfo[];
}

// 教学楼信息接口
export interface BuildingInfo {
    building: string;
    label: string;
    value: number;
    infos: CourseInfo[];
    floors?: FloorInfo[];  // 可选的楼层信息，用于新的四级导航
}

// 学部信息接口（假设最外层数组每个元素是一个学部）
export interface DivisionInfo {
    [key: number]: BuildingInfo[];
}
// 新增：课程评价提交数据的接口
export interface CourseReviewPayload {
    courseId: string | number; // 课程ID
    rating: number;           // 课程评分 (例如 1-5)
    comment: string;          // 课程评论内容
    author?: UserProfile; // 可选，评价人ID，后端可能会从token中获取
}

// 新增：课程评价信息接口 (如果需要获取和展示评价列表)
export interface CourseReviewInfo extends CourseReviewPayload {
    id: string | number;        // 评价本身的ID
    reviewerName?: string;    // 评价人名称
    createdAt?: string | Date;  // 评价时间
}

// 建议增加一个更详细的课程信息类型，用于包含描述、平均分等
export interface CourseDetail extends CourseInfo {
    description?: string;
    credits?: number;
    rating?: number; // 平均评分
    reviewCount?: number; // 评价数量
    // 其他详细信息
}

// 当前课程时间信息接口
export interface CurrentTimeInfo {
    weekNum: number;        // 当前周次
    weekday: number;        // 星期几（1-7）
    weekdayName: string;    // 星期名称（如"周三"）
    lessonNum: number;      // 当前节次
    lessonStatus: string;   // 节次状态（如"第3节"）
    timestamp: number;      // 时间戳
}