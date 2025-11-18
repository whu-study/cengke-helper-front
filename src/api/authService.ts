// src/api/authService.ts
import { myRequest } from './myAxios';
import { apiPrefix } from './globalConst';
import type { UserProfile } from '@/types/user';
import type { TransDef } from "@/api/type.ts";
import { webGetProfile, webUpdateProfile } from '@/api/profile';

// --- 登录请求体和响应数据类型 ---
export interface LoginCredentials {
    username?: string; // 根据你的后端要求，可能是用户名或邮箱 (Based on your backend requirements, could be username or email)
    email?: string;
    password?: string;
    // captcha?: string; // 例如，验证码 (e.g., captcha)
}

export interface LoginResponseData {
    token: string;
    user?: UserProfile; // (可选) 登录后直接返回用户信息 (Optional: return user info directly after login)
}

// --- 注册请求体和响应数据类型 ---
export interface RegisterPayload extends Omit<UserProfile, 'id' | 'createdAt' | 'role'> {
    password: string; // 注册时通常需要密码 (Password usually required for registration)
    emailCode: string;
    username: string;
    avatar: string;
    bio: string;
    // confirmPassword?: string;
}

export interface RegisterResponseData {
    token: string;
    user: UserProfile; // 注册成功后返回创建的用户信息 (Return created user info after successful registration)
}


// --- API 服务函数 ---

/**
 * 用户登录
 * User login.
 * @param credentials - 登录凭据 (Login credentials)
 */
export const apiLogin = (credentials: LoginCredentials): Promise<TransDef<LoginResponseData>> => {
    return myRequest<LoginCredentials, LoginResponseData>({
        method: 'POST',
        url: `${apiPrefix}/auth/user-login`, // 示例端点 (Example endpoint)
        data: credentials,
    });
};
export const webSendEmailVerifyCode = (email: string): Promise<TransDef> => {
    return myRequest({
        method: "POST",
        url: `${apiPrefix}/auth/send-email-code`,
        data: {
            email
        }
    });

}
/**
 * 用户注册
 * User registration.
 * @param userRegInfo - 用户注册信息 (User registration information)
 */
export const apiRegister = (userRegInfo: RegisterPayload): Promise<TransDef<RegisterResponseData>> => {
    return myRequest<RegisterPayload, RegisterResponseData>({
        method: 'POST',
        url: `${apiPrefix}/auth/user-register`, // 示例端点 (Example endpoint)
        data: userRegInfo,
    });
};

/**
 * 用户登出
 * User logout.
 * (后端可能需要使 Token 失效)
 * (Backend might need to invalidate the token)
 */
export const apiLogout = (): Promise<TransDef<null>> => {
    return myRequest<never, null>({
        method: 'POST',
        url: `${apiPrefix}/auth/user-logout`, // 示例端点 (Example endpoint)
    });
};

/**
 * 获取当前登录用户的个人资料
 * Fetches the profile of the currently logged-in user.
 * (Token 会在 myAxios 拦截器中自动添加)
 * (Token will be automatically added in myAxios interceptor)
 */
// 统一使用 profile.ts 中的实现，向后兼容导出
export const apiFetchUserProfile = webGetProfile;

/**
 * 更新用户个人资料
 * Updates user profile.
 * @param profileData - 要更新的个人资料数据 (Profile data to update)
 */
// 统一使用 profile.ts 中的实现，向后兼容导出
export const apiUpdateUserProfile = webUpdateProfile;
