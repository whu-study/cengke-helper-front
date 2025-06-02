import {ref} from "vue";
import type {CourseInfo} from "@/types/course.ts";
import type {UserProfile} from "@/types/user.ts";

export const validData = ref(true)

export const isGlobalDrawOpen = ref(false)

export const globalCurCourseInfo = ref<CourseInfo>({
    id: 0,
    courseName: "",
    courseTime: "",
    courseType: "",
    faculty: "",
    room: "",
    teacherName: "",
    teacherTitle: ""
})
export const globalUserProfile = ref<UserProfile>({
    avatar: "", bio: "", createdAt: new Date(), email: "", id: 0, role: 0, username: ""
})

export const globalLoginPageNo = ref(0)