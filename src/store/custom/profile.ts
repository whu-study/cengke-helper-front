import {ref} from "vue";
import type {UserProfile} from "@/types/user.ts";

export const globalUserProfile = ref<UserProfile>({
    avatar: "", bio: "", createdAt: new Date(), email: "", id: 0, role: 0, username: ""
})