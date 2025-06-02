// stores/userStore.ts
import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {UserProfile} from "@/types/user.ts";
import {apiLogout, apiUpdateUserProfile, apiFetchUserProfile} from "@/api/authService.ts";
import {ElMessage} from 'element-plus';
import {useRouter} from 'vue-router';
import type {TransDef} from "@/api/type.ts";
import {showErrorMsg} from "@/utils/globalFunc.ts";

export const useUserToken = defineStore(
    'token',
    () => {
        const token = ref<string>('')
        const setToken = (newToken: string) => {
            token.value = newToken
        }
        return {
            token,
            setToken,
        }
    },
    {
        persist: true,
    }
)
export const useUserStore = defineStore(
    'user',
    () => {
        // 类型化响应式状态
        const userInfo = ref<UserProfile>({
            id: 0,
            username: '',
            email: '',
            avatar: '',
            bio: '',
            role: 0,
            createdAt: new Date('Invalid Date')
        })
        const isLoading = ref(false);
        const error = ref<string | null>(null);

        const ifLogin = ref<boolean>(false)
        const setLogin = (status: boolean) => {
            ifLogin.value = status
        }
        // 类型化的用户操作方法
        const setUser = (newInfo: Partial<UserProfile>) => {
            userInfo.value = {...userInfo.value, ...newInfo}
        }

        const clearUser = () => {
            userInfo.value = {
                id: 0,
                username: '',
                email: '',
                avatar: '',
                bio: '',
                role: 0,
                createdAt: new Date('Invalid Date')
            }
        }

        function fetchUserProfile() {
            isLoading.value = true;
            error.value = null;
            apiFetchUserProfile()
                .then((response: TransDef<UserProfile>) => {
                    if (response.code === 0 && response.data) {
                        userInfo.value = response.data
                        return
                    }
                    showErrorMsg(response.msg || "获取用户信息失败")
                })
        }

        function logout() {
            isLoading.value = true;
            error.value = null;
            const logoutPromise = ifLogin.value ? apiLogout() : Promise.resolve({
                code: 0,
                msg: '用户未登录或Token已清除 (User not logged in or token already cleared)'
            } as TransDef<null>);

            logoutPromise
                .then((response: TransDef<null>) => {
                    if (response.code === 0) {
                        ElMessage.success(response.msg || '您已成功登出');
                    } else {
                        // 即便后端登出失败，前端也应认为已登出
                        console.warn('Backend logout may have failed or was not needed, but proceeding with client-side logout:', response.msg);
                        ElMessage.info('本地状态已清除 (Local state cleared)');
                    }
                })
                .finally(() => {
                    setUser({
                        id: 0,
                        username: '',
                        email: '',
                        avatar: '',
                        bio: '',
                        role: 0,
                        createdAt: new Date('Invalid Date')
                    });
                    isLoading.value = false;
                    setLogin(false)
                });
        }


        function updateUserProfile(profileData: Partial<UserProfile>){
            isLoading.value = true;
            error.value = null;
                apiUpdateUserProfile(profileData)
                    .then((response: TransDef<UserProfile>) => {
                        if (response.code === 0 && response.data) {
                            setUser(response.data);
                            ElMessage.success('个人资料更新成功！');
                            return
                        }
                        showErrorMsg(response.msg || "更新用户信息失败")
                    })
                    .finally(() => {
                        isLoading.value = false;
                    });
        }


        return {
            userInfo,
            ifLogin,
            setUser,
            clearUser,
            setLogin,
            fetchUserProfile,
            logout,
            updateUserProfile,
        }
    },
    {
        persist: true
    }
)