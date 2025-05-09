import type {TransDef} from "@/api/myAxios.ts";

export const webSendEmailVerifyCode = (email: string):Promise<TransDef> => {
    // return myRequest({
    //     method: "POST",
    //     url: apiPrefix+"/users/sendEmailVerifyCode",
    //     data: {
    //         email
    //     }
    return Promise.resolve({
        code: 0,
        data: null,
        msg: "success"

    })as unknown as Promise<TransDef>

}