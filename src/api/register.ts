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

export const webUserRegister=(email:string,password:string,emailCode:string):Promise<TransDef> =>{
    return Promise.resolve(
        {
            code:0,
            data:{
                userInfo:{
                    id: 0,
                        username: '',
                    email: '',
                    avatar: '',
                    bio: '',
                    role: 0,
                    createdAt:new Date('Invalid Date')
                },
                token:'123456789'

            },
            msg:"注册成功"
        }
    )as unknown as Promise<TransDef>
}

