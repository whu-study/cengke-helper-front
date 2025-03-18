import {ref} from "vue";
import type {CourseInfo} from "@/store/modules/courseInfosStore.ts";

export const validData = ref(true)

export const isGlobalDrawOpen = ref(false)

export const globalCurCourseInfo = ref<CourseInfo>({
    courseName: "",
    courseTime: "",
    courseType: "",
    faculty: "",
    room: "",
    teacherName: "",
    teacherTitle: ""
})
