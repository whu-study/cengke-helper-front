// src/store/modules/userStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfile } from '@/types/user';
import { globalUserProfile } from '@/store/custom/globalData';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

import {
    apiLogin,
    apiFetchUserProfile,
    apiLogout,
    apiRegister,
    apiUpdateUserProfile,
    type LoginCredentials,
    type RegisterPayload
} from '@/api/authService';
import { userTokenKey } from '@/api/globalConst';
import type { TransDef } from '@/api/myAxios'; // 导入 TransDef 类型

export const useUserStore = defineStore('user', () => {
    const token = ref<string | null>(localStorage.getItem(userTokenKey) || null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const isAuthenticated = computed(() => !!token.value && !!globalUserProfile.value);
    const currentUser = computed(() => globalUserProfile.value);
    const isAdmin = computed(() => {
        const role = globalUserProfile.value?.role;
        return  role === 1;
    });

    function setToken(newToken: string | null) {
        token.value = newToken;
        if (newToken) {
            localStorage.setItem(userTokenKey, newToken);
        } else {
            localStorage.removeItem(userTokenKey);
        }
    }

    function setUserProfile(profile: UserProfile) {
        globalUserProfile.value = profile;
    }

    function login(credentials: LoginCredentials): Promise<boolean> {
        isLoading.value = true;
        error.value = null;
        return new Promise((resolve, reject) => {
            apiLogin(credentials)
                .then((response: TransDef<any>) => { // 显式指定 response 类型
                    if (response.code === 0 && response.data?.token) {
                        setToken(response.data.token as string);
                        if (response.data.user) {
                            setUserProfile(response.data.user as UserProfile);
                            ElMessage.success(response.msg || '登录成功！');
                            resolve(true);
                        } else {
                            // 登录成功后获取用户信息
                            return fetchUserProfile().then(() => { // 链式Promise
                                ElMessage.success(response.msg || '登录成功！');
                                resolve(true);
                            }).catch(fetchProfileError => {
                                // fetchUserProfile 内部会处理自己的错误和状态，但如果它也抛出，这里可以捕获
                                console.error('Login successful, but fetchUserProfile failed:', fetchProfileError);
                                // 即便获取用户信息失败，Token也已设置，根据业务逻辑决定是否算登录成功
                                // 此处我们假设获取用户信息是登录流程的一部分
                                reject(new Error('登录成功但获取用户信息失败'));
                            });
                        }
                    } else {
                        throw new Error(response.msg || '登录失败');
                    }
                })
                .catch((err: any) => {
                    error.value = err.message || '登录时发生错误';
                    setUserProfile(null);
                    setToken(null);
                    ElMessage.error(error.value);
                    console.error('Login action error:', err);
                    reject(err); // 将错误传递给 Promise 的调用者
                })
                .finally(() => {
                    isLoading.value = false;
                });
        });
    }

    function fetchUserProfile(): Promise<UserProfile | null> {
        if (!token.value) {
            setUserProfile(null);
            return Promise.resolve(null); // 没有token，直接返回
        }
        isLoading.value = true;
        error.value = null;
        return new Promise((resolve, reject) => {
            apiFetchUserProfile()
                .then((response: TransDef<UserProfile>) => {
                    if (response.code === 0 && response.data) {
                        setUserProfile(response.data);
                        resolve(response.data);
                    } else {
                        setUserProfile(null);
                        setToken(null); // Token 无效或过期
                        throw new Error(response.msg || '获取用户信息失败，请重新登录');
                    }
                })
                .catch((err: any) => {
                    error.value = err.message;
                    setUserProfile(null);
                    setToken(null);
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
            const logoutPromise = token.value ? apiLogout() : Promise.resolve({ code: 0, msg: '用户未登录或Token已清除 (User not logged in or token already cleared)' } as TransDef<null>);

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
                    setUserProfile(null);
                    setToken(null);
                    isLoading.value = false;
                    router.push({ name: 'home' }); // 或登录页
                });
        });
    }

    function register(userInfo: RegisterPayload): Promise<boolean> {
        isLoading.value = true;
        error.value = null;
        return new Promise((resolve, reject) => {
            apiRegister(userInfo)
                .then((response: TransDef<any>) => { // 假设 RegisterResponseData 包含 user 和 token
                    if (response.code === 0 && response.data?.token && response.data?.user) {
                        setToken(response.data.token as string);
                        setUserProfile(response.data.user as UserProfile);
                        ElMessage.success('注册成功，已自动登录！');
                        resolve(true);
                    } else {
                        throw new Error(response.msg || '注册失败');
                    }
                })
                .catch((err: any) => {
                    error.value = err.message || '注册时发生错误';
                    ElMessage.error(error.value);
                    console.error('Register action error:', err);
                    reject(err);
                })
                .finally(() => {
                    isLoading.value = false;
                });
        });
    }

    function updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
        if (!globalUserProfile.value?.id) {
            const msg = '用户未登录或无法确定用户ID';
            ElMessage.error(msg);
            return Promise.reject(new Error(msg));
        }
        isLoading.value = true;
        error.value = null;
        return new Promise((resolve, reject) => {
            apiUpdateUserProfile(profileData)
                .then((response: TransDef<UserProfile>) => {
                    if (response.code === 0 && response.data) {
                        setUserProfile(response.data);
                        ElMessage.success('个人资料更新成功！');
                        resolve(response.data);
                    } else {
                        throw new Error(response.msg || '更新个人资料失败');
                    }
                })
                .catch((err: any) => {
                    error.value = err.message || '更新个人资料时发生错误';
                    ElMessage.error(error.value);
                    console.error('Update user profile error:', err);
                    reject(err);
                })
                .finally(() => {
                    isLoading.value = false;
                });
        });
    }

    function checkAuthStatus(): Promise<void> {
        if (token.value && !globalUserProfile.value) {
            return fetchUserProfile().then(() => {}).catch(() => {}); // 调用并忽略结果，fetchUserProfile内部会处理UI
        }
        return Promise.resolve();
    }

    return {
        token,
        isLoading,
        error,
        isAuthenticated,
        currentUser,
        isAdmin,
        login,
        logout,
        fetchUserProfile,
        register,
        updateUserProfile,
        setToken,
        setUserProfile,
        checkAuthStatus,
    };
});
