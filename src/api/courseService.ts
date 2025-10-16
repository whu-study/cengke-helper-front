import { myRequest } from "@/api/myAxios.ts";
// 确保从 @/types/course 导入类型
import type { CourseReviewPayload, CourseDetail, CourseReviewInfo as CourseReview, CurrentTimeInfo } from '@/types/course';
import { apiPrefix } from "./globalConst.ts";

// 课程查询参数接口
export interface CourseQueryParams {
    weekNum?: number;    // 周次
    weekday?: number;    // 星期几 (1-7)
    lessonNum?: number;  // 节次
}

export const getCourseList = (params?: CourseQueryParams): Promise<TransDef<BuildingInfo[][]>> => {
    return myRequest({
        method: 'GET',
        url: apiPrefix + '/courses/structured',
        params: params // 添加查询参数
    })
}

// 根据课程ID获取课程详细信息
export const getCourseDetail = (courseId: number): Promise<TransDef<CourseDetail>> => { // courseId: number
    return myRequest({
        method: 'GET',
        url: `${apiPrefix}/courses/${courseId}`
    });
};

// 获取指定课程的评价列表
export const getCourseReviews = (courseId: number): Promise<TransDef<CourseReview[]>> => { // courseId: number
    return myRequest({
        method: 'GET',
        url: `${apiPrefix}/courses/reviews/${courseId}`
    });
};

// 提交课程评价的API函数
export const submitCourseReview = (payload: CourseReviewPayload): Promise<TransDef> => {
    // payload.courseId 的类型在 course.ts 中是 string | number
    // 如果后端严格要求 number，确保在 store 中转换或在此处转换
    return myRequest({
        method: 'POST',
        // url: `${apiPrefix}/courses/${payload.courseId}/reviews`, // 如果后端API路径包含courseId
        url: apiPrefix + '/courses/reviews', // 或者如果 courseId 在 payload 中
        data: payload
    });
};

// 获取当前课程时间信息
export const getCurrentTime = (): Promise<TransDef<CurrentTimeInfo>> => {
    return myRequest({
        method: 'GET',
        url: `${apiPrefix}/courses/current-time`
    });
};

// BuildingInfo 类型也应该在这里被引用或导入，如果 getCourseList 返回的是它
// (假设 BuildingInfo 也是在 @/types/course.ts 中定义的)
import type { BuildingInfo } from '@/types/course';
import type { TransDef } from "@/api/type.ts";