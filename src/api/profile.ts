import {myRequest, type TransDef} from "@/api/myAxios.ts";
import type {UserProfile} from "@/types/user.ts";
import {apiPrefix} from "@/api/globalConst.ts";

export const webGetProfile =  ():Promise<TransDef> => {
    // return myRequest({
    //     method: "GET",
    //     url: apiPrefix+"/users/profile",
    // })

    const res:UserProfile = {
        id: 1,
        username: "薛涛",
        email: "1921@qq.com",
        avatar: "URL_ADDRESSm",
        bio: "这是一个测试用户",
        role: 0,
        createdAt: new Date()
    }
    return Promise.resolve({
        code: 0,
        msg: "success",
        data: res
    })
}

