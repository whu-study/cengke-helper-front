import type {TransDef} from "@/api/myAxios.ts";

export  const webSendLogin=(email:string,password:string):Promise<TransDef>=>{
    return Promise.resolve({
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
        msg:'登录成功'
    })
}