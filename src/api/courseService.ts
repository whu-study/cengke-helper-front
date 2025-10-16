import {myRequest} from "@/api/myAxios.ts";
// 确保从 @/types/course 导入类型
import type { CourseReviewPayload, CourseDetail, CourseReviewInfo as CourseReview } from '@/types/course';
import {apiPrefix} from "./globalConst.ts";

export const getCourseList = (): Promise<TransDef<BuildingInfo[][]>> => { // 假设 getCourseList 返回的是 BuildingInfo 数组的 TransDef
    return myRequest({
        method: 'GET',
        url: apiPrefix + '/courses/structured'
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

// BuildingInfo 类型也应该在这里被引用或导入，如果 getCourseList 返回的是它
// (假设 BuildingInfo 也是在 @/types/course.ts 中定义的)
import type { BuildingInfo } from '@/types/course';
import type {TransDef} from "@/api/type.ts";