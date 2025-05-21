import CryptoJS from "crypto-js";

export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 计算时间间隔
export const getTimeGap = (now: Date, last: Date): string => {
    const millisecondsGap = now.valueOf() - last.valueOf();
    const yearGap = Math.floor(millisecondsGap / (1000 * 60 * 60 * 24 * 365));
    if (yearGap > 0) return yearGap + " 年前";


    const monthGap = Math.floor(millisecondsGap / (1000 * 60 * 60 * 24 * 30));
    if (monthGap > 0) return monthGap + " 月前";

    const dayGap = Math.floor(millisecondsGap / (1000 * 60 * 60 * 24));
    if (dayGap > 0) return dayGap + " 天前";

    const hourGap = Math.floor(millisecondsGap / (1000 * 60 * 60));
    if (hourGap > 0) return hourGap + " 小时前";

    const minuteGap = Math.floor(millisecondsGap / (1000 * 60));
    if (minuteGap > 0) return minuteGap + " 分钟前";

    const secondGap = Math.floor(millisecondsGap / (1000));
    if (secondGap > 0) return secondGap + " 秒前";
    return "刚刚";
}


const errorNotice = (msg: string) => {
    ElNotification({
        title: 'Error',
        message: msg,
        type: 'error',
    })
}

const errorMessage = (msg: string) => {
    ElMessage({
        showClose: true,
        message: msg,
        type: 'error',
        plain: true,
    })
}

const successNotice = (msg: string) => {
    ElNotification({
        title: 'Success',
        message: msg,
        type: 'success',
    })
}

const successMessage = (msg: string) => {
    ElMessage({
        showClose: true,
        message: msg,
        type: 'success',
        plain: true,
    })
}

export const showErrorMsg = (msg: string) => {
    isMobile() ? errorMessage(msg) : errorNotice(msg)
}

export const showSuccessMsg = (msg: string) => {
    isMobile() ? successMessage(msg) : successNotice(msg)
}

export const encryptPassword = (password: string): string => {
    return CryptoJS.MD5(password+"salt-whu").toString();
}




