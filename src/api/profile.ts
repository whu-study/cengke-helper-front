import { myRequest } from "@/api/myAxios.ts";
import { apiPrefix } from "../api/globalConst.ts";
import type { TransDef } from "@/api/type.ts";
import type { UserProfile } from '@/types/user';

/**
 * 获取当前登录用户的个人信息（包含统计字段 ExtendedUserProfileVO）
 */
export const webGetProfile = (): Promise<TransDef<UserProfile>> => {
    return myRequest<never, UserProfile>({
        method: 'GET',
        url: apiPrefix + '/users/profile'
    });
};

/**
 * 更新当前登录用户的个人信息
 */
export const webUpdateProfile = (profileData: Partial<UserProfile>): Promise<TransDef<UserProfile>> => {
    return myRequest<Partial<UserProfile>, UserProfile>({
        method: 'PUT',
        url: apiPrefix + '/users/profile',
        data: profileData,
    });
};