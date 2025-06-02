import axios, {type AxiosRequestConfig} from "axios";
import {userTokenKey, baseURL} from "./globalConst";
import { useUserToken } from "@/store/modules/userStore";
import {showErrorMsg} from "@/utils/globalFunc.ts";


const myAxios = axios.create({baseURL});

// 请求拦截器
myAxios.interceptors.request.use(config => {
    // TODO 这里吧本地的token添加到请求头中
    const userToken = useUserToken();
    // const token = localStorage.getItem(userTokenKey);
    const token = userToken.token;
    console.log('Current token:', token);  // 调试输出

    if (token) {
        config.headers.Authorization = `${token}`;
    }
    return config;
});
myAxios.interceptors.response.use(
    success => {
        // 解包
        return success?.data || {}
    },
    (error = {}) => {
        const {response = {}} = error || {};

        // 加号将后面的内容转换为数字，`?.`是可选链操作符，为空则表达式结果为undefined而非报错
        switch (+response?.status) {
            case 401: // 鉴权失败时执行此逻辑
            {
                const msg = response?.data?.msg || "鉴权失败"
                console.log("鉴权失败:"+msg)
                // TODO: 鉴权失败时执行此逻辑
                showErrorMsg(msg)
                // 退出登陆状态
                // useUserStore().logout()
                break;
            }
            case 403: // 权限不够时执行此逻辑
            {
                const msg = response?.data?.msg || "权限不足"
                console.log("权限不足")
                // TODO

                break;
            }
            case 400: {
                const msg = response?.data?.msg || "请求有误"
                showErrorMsg(msg)
                if (response?.data?.code === 10001) {
                    // 退出登陆状态
                    // useUserStore().logout()
                    // TODO

                }
                if (response?.data?.code === 10002) {
                    // 退出登陆状态
                    // useUserStore().logout()
                    // TODO

                }
                if (response?.data?.code === 10003) {
                    // 退出登陆状态
                    // TODO

                }
                console.log("请求有误")
                break;
            }
            default: // 未知错误
            {
                console.log(error)
                console.log(response)
                const msg = response?.data?.msg || "网络错误，后端未部署或您未接入互联网"
                // TODO
                showErrorMsg(msg)

                break
            }


        }
        return Promise.reject(response?.data || {});
    }
)

// myAxios.ts
export function myRequest<T = never, R = any>(config: AxiosRequestConfig<T>): Promise<TransDef<R>> {
    return myAxios(config);
}
export const successCode = 0;
