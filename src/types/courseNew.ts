/**
 * 新的课程信息API响应结构设计
 * 这个结构更适合四级导航：学部 → 教学楼 → 楼层 → 课程
 */

// 基础课程信息
export interface CourseInfo {
    id: number;
    courseName: string;        // 课程名称
    courseCode: string;        // 课程代码，如 "CS101"
    teacherName: string;       // 教师姓名
    teacherTitle: string;      // 教师职称
    faculty: string;           // 所属学院
    credits: number;           // 学分
    courseType: string;        // 课程类型：必修课、选修课、专业课等

    // 时间和地点信息
    room: string;              // 教室号，如 "A301"
    timeSlots: TimeSlot[];     // 上课时间段（支持多个时间）

    // 额外信息
    capacity?: number;         // 容量
    enrolled?: number;         // 已选人数
    description?: string;      // 课程描述
    prerequisites?: string[];  // 前置课程

    // 评价信息（可选，用于展示）
    averageRating?: number;    // 平均评分
    reviewCount?: number;      // 评价数量
}

// 上课时间段
export interface TimeSlot {
    dayOfWeek: number;         // 星期几 (1-7, 1为周一)
    startPeriod: number;       // 开始节次
    endPeriod: number;         // 结束节次
    weeks?: string;            // 上课周次，如 "1-16周" 或 "单周" 或 "1-8,10-16周"
}

// 楼层信息
export interface FloorInfo {
    floorId: string;           // 楼层ID，如 "A_1", "A_2", "B_1"
    floorName: string;         // 楼层名称，如 "A楼1层", "B楼2层"
    floorNumber: number;       // 楼层数字，如 1, 2, 3
    description?: string;      // 楼层描述

    // 教室和课程信息
    rooms: RoomInfo[];         // 该楼层的教室列表
    courses: CourseInfo[];     // 该楼层的课程列表
}

// 教室信息
export interface RoomInfo {
    roomId: string;           // 教室ID
    roomNumber: string;       // 教室号，如 "A301"
    roomName?: string;        // 教室名称，如 "多媒体教室1"
    capacity?: number;        // 教室容量
    roomType?: string;        // 教室类型：普通教室、实验室、多媒体教室等
    facilities?: string[];    // 设施列表：投影仪、空调等
}

// 教学楼信息
export interface BuildingInfo {
    buildingId: string;       // 教学楼ID，如 "building_a", "building_b"
    buildingName: string;     // 教学楼名称，如 "文理学部教学楼A"
    buildingCode: string;     // 教学楼代码，如 "A", "B", "C"
    address?: string;         // 详细地址
    description?: string;     // 建筑描述

    // 楼层信息
    floors: FloorInfo[];      // 楼层列表，按楼层号排序

    // 统计信息
    totalFloors: number;      // 总楼层数
    totalRooms: number;       // 总教室数
    totalCourses: number;     // 总课程数
}

// 学部信息
export interface DivisionInfo {
    divisionId: string;       // 学部ID，如 "liberal_arts", "engineering"
    divisionName: string;     // 学部名称，如 "文理学部", "工学部"
    description?: string;     // 学部描述
    icon?: string;           // 学部图标URL

    // 教学楼列表
    buildings: BuildingInfo[];

    // 统计信息
    totalBuildings: number;   // 总教学楼数
    totalFloors: number;      // 总楼层数
    totalCourses: number;     // 总课程数
}

// API响应结构
export interface CourseDataResponse {
    code: number;
    msg: string;
    data: DivisionInfo[];     // 学部列表
}

// 筛选参数
export interface CourseFilterParams {
    divisionId?: string;      // 学部筛选
    buildingId?: string;      // 教学楼筛选
    floorId?: string;         // 楼层筛选
    faculty?: string;         // 学院筛选
    courseType?: string;      // 课程类型筛选
    dayOfWeek?: number;       // 星期筛选
    timeSlot?: number[];      // 时间段筛选
    teacherName?: string;     // 教师筛选
    keyword?: string;         // 关键词搜索
}

// 课程详情（扩展版本）
export interface CourseDetail extends CourseInfo {
    syllabus?: string;        // 教学大纲
    textbooks?: Textbook[];   // 教材列表
    schedule: CourseSchedule[]; // 详细课程安排
    exams?: ExamInfo[];       // 考试信息
    assignments?: Assignment[]; // 作业信息
}

// 教材信息
export interface Textbook {
    title: string;
    author: string;
    publisher: string;
    isbn?: string;
    isRequired: boolean;      // 是否必需
}

// 课程安排
export interface CourseSchedule {
    week: number;             // 第几周
    date: string;            // 具体日期
    topic: string;           // 课程主题
    room: string;            // 教室
    timeSlot: TimeSlot;      // 时间段
}

// 考试信息
export interface ExamInfo {
    examType: string;        // 考试类型：期中、期末、随堂测验
    date: string;           // 考试日期
    time: string;           // 考试时间
    room: string;           // 考试地点
    duration: number;       // 考试时长（分钟）
    description?: string;   // 考试说明
}

// 作业信息
export interface Assignment {
    title: string;
    description: string;
    dueDate: string;
    maxScore: number;
    status?: 'pending' | 'submitted' | 'graded';
}

/**
 * 使用示例：
 * 
 * 1. 获取所有课程数据：
 * GET /api/courses
 * Response: CourseDataResponse
 * 
 * 2. 按条件筛选课程：
 * GET /api/courses/search?divisionId=liberal_arts&buildingId=building_a
 * 
 * 3. 获取课程详情：
 * GET /api/courses/{courseId}/detail
 * Response: { code: 0, msg: "success", data: CourseDetail }
 * 
 * 数据结构优势：
 * 1. 层次清晰：学部 → 教学楼 → 楼层 → 课程
 * 2. 便于筛选：每个层级都有独立的ID和信息
 * 3. 易于扩展：可以轻松添加新的字段和功能
 * 4. 支持复杂查询：多种筛选条件组合
 * 5. 统计信息完整：每个层级都有相关统计数据
 */