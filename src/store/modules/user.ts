// stores/userStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {UserProfile} from "@/types/user.ts";


export const useUserToken=defineStore('token',()=>{
        const token = ref<string>('')
        const persist = {
            key: 'userTokenKey',
            storage: localStorage,
            paths: ['token'] as const
        }
        const setToken=(newToken:string)=>{
            token.value = newToken
        }
        return{
            token,
            setToken,
            persist
        }

    },
    {
        persist:true
    }
)
export const useUserStore = defineStore('user', () => {
    // 类型化响应式状态
    const userInfo = ref<UserProfile>({
        id: 0,
        username: '',
        email: '',
        avatar: '',
        bio: '',
        role: 0,
        createdAt:new Date('Invalid Date')
    })
    const ifLogin=ref<boolean>(false)
    // 持久化配置（需安装 pinia-plugin-persistedstate）
    const persist = {
        key: 'user-storage',
        storage: localStorage,
        paths: ['userInfo'] as const
    }
    const setLogin=(status:boolean)=>{
        ifLogin.value=status
    }
    // 类型化的用户操作方法
    const setUser = (newInfo: Partial<UserProfile>) => {
        userInfo.value = { ...userInfo.value, ...newInfo }
    }

    const clearUser = () => {
        userInfo.value = {
            id: 0,
            username: '',
            email: '',
            avatar: '',
            bio: '',
            role: 0,
            createdAt:new Date('Invalid Date')
        }
    }

    return {
        userInfo,
        setUser,
        clearUser,
        persist,
        setLogin
    }
}, {
    persist: true
})