import {ref} from "vue";
import type {CourseInfo} from "@/store/modules/courseInfosStore.ts";
import type {UserProfile} from "@/types/user.ts";

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
export const globalUserProfile = ref<UserProfile>({
    avatar: "", bio: "", createdAt: new Date(), email: "", id: 0, role: 0, username: ""
})
