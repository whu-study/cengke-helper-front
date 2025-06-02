// stores/userStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {UserProfile} from "@/types/user.ts";
import {apiLogout,apiUpdateUserProfile,apiFetchUserProfile} from "@/api/authService.ts";
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import type {TransDef} from "@/api/type.ts";
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
    const isLoading = ref(false);
    const error = ref<string | null>(null);

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

    function fetchUserProfile(): Promise<UserProfile | null> {

        isLoading.value = true;
        error.value = null;
        return new Promise((resolve, reject) => {
            apiFetchUserProfile()
                .then((response: TransDef<UserProfile>) => {
                    if (response.code === 0 && response.data) {
                        resolve(response.data);
                    } else {
                        throw new Error(response.msg || '获取用户信息失败，请重新登录');
                    }
                })
                .catch((err: any) => {
                    error.value = err.message;
                    console.error('Fetch user profile error:', err);
                    // ElMessage.error(error.value); // 可以在调用处处理
                    reject(err);
                })
                .finally(() => {
                    isLoading.value = false;
                });
        });
    }

    function logout(): Promise<void> {
        const router = useRouter();
        isLoading.value = true;
        error.value = null;
        return new Promise((resolve, reject) => {
            const logoutPromise = ifLogin.value ? apiLogout() : Promise.resolve({ code: 0, msg: '用户未登录或Token已清除 (User not logged in or token already cleared)' } as TransDef<null>);

            logoutPromise
                .then((response : TransDef<null>) => {
                    if (response.code === 0) {
                        ElMessage.success(response.msg || '您已成功登出');
                    } else {
                        // 即便后端登出失败，前端也应认为已登出
                        console.warn('Backend logout may have failed or was not needed, but proceeding with client-side logout:', response.msg);
                        ElMessage.info('本地状态已清除 (Local state cleared)');
                    }
                    resolve();
                })
                .catch((err: any) => {
                    error.value = err.message || '登出时发生错误，但本地状态已清除';
                    console.error('Logout action error:', err);
                    // 即使API失败，也继续前端的清理工作
                    resolve(); // 或者 reject(err) 如果希望调用者处理API错误
                })
                .finally(() => {
                    setUser({
                        id: 0,
                        username: '',
                        email: '',
                        avatar: '',
                        bio: '',
                        role: 0,
                        createdAt:new Date('Invalid Date')
                    });
                    isLoading.value = false;
                    setLogin(false)
                    router.push({ name: 'home' }); // 或登录页
                });
        });
    }

    

    function updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
        isLoading.value = true;
        error.value = null;
        return new Promise((resolve, reject) => {
            apiUpdateUserProfile(profileData)
                .then((response: TransDef<UserProfile>) => {
                    if (response.code === 0 && response.data) {
                        setUser(response.data);
                        ElMessage.success('个人资料更新成功！');
                        resolve(response.data);
                    } else {
                        throw new Error(response.msg || '更新个人资料失败');
                    }
                })
                .catch((err: any) => {
                    error.value = err.message || '更新个人资料时发生错误';
                    ElMessage.error(error.value || '更新个人资料时发生错误');
                    console.error('Update user profile error:', err);
                    reject(err);
                })
                .finally(() => {
                    isLoading.value = false;
                });
        });
    }


    return {
        userInfo,
        ifLogin,
        setUser,
        clearUser,
        persist,
        setLogin,
        fetchUserProfile,
        logout,
        updateUserProfile,
    }
})