<script setup lang="ts">
import { ref, reactive ,computed} from 'vue'
import { ElMessage } from 'element-plus'
import Identify from '@/components/login/IdentifyCode.vue'
import { webSendEmailVerifyCode, apiRegister} from '@/api/authService.ts'
import type {TransDef} from "@/api/myAxios.ts";
import  {successCode} from "@/api/myAxios.ts";
import {useRouter} from "vue-router";
import {useUserStore, useUserToken} from "@/store/modules/userStore.ts";
import type {UserProfile} from "@/types/user.ts";

const userStore=useUserStore()
const userToken=useUserToken()
const router=useRouter()

type ValidateFields = 'email' | 'captcha' | 'emailCode' | 'password' | 'confirmPassword'
const validate=ref<Record<ValidateFields, boolean>>({
  email: false,
  captcha: false,
  emailCode: false,
  password: false,
  confirmPassword: false
})

const realData=reactive({
  email:'',
  password:''
})
const formRef = ref()
//设置是否允许注册
const ifCanRegister=ref(false)
//是否允许发送验证码
const isvalid = computed(() => {
  return !(validate.value.email &&
      validate.value.captcha &&

      validate.value.password &&
      validate.value.confirmPassword&&!isSending.value)
})
const ifRegister = computed(()=>{
  return !(validate.value.email&&validate.value.password&&validate.value.confirmPassword&&validate.value.emailCode&&ifCanRegister.value)
})
// 表单数据
const formData = reactive({
  email: '',
  captcha: '',
  emailCode: '',
  password: '',
  confirmPassword: ''
})

// 图形验证码相关
const captchaCode = ref('')

const updateCode = (code:string) => {
  captchaCode.value = code
  console.log(captchaCode.value)
}


// 邮箱验证码发送
const isSending = ref(false)
const sendBtnText = ref('获取验证码')

const validateFormItem= (field:ValidateFields)=>{
  // try {
  //    formRef.value?.validateField(field)
  //   validate.value[field] = true
  //
  // }catch (err) {
  //   validate.value[field]=false
  // }
  formRef.value?.validateField(field).then(() => {
    validate.value[field] = true;
  }).catch((err: Error) => { // 修正括号
    console.log('触发错误');
    console.log(err);
    validate.value[field] = false;
  });

}

const sendEmailCode = async () => {

  if (!formData.email) {
    ElMessage.error('请先输入邮箱')
    return
  }
  //调用后端api发送验证码
  try {
    const result=await webSendEmailVerifyCode(formData.email) as TransDef

    if(result.code===successCode){
      console.log("发送成功",result.msg)
      ElMessage.success(result.msg)
      //存储此次发送时的邮箱和密码信息
      realData.email=formData.email
      realData.password=formData.password
      //可以注册了
      ifCanRegister.value=true
      //设置重发倒计时
      isSending.value = true
      let count = 3
      const timer = setInterval(() => {
        sendBtnText.value = `${count}秒后重发`
        if (count-- <= 0) {
          clearInterval(timer)
          isSending.value = false
          sendBtnText.value = '获取验证码'
        }
      }, 1000)

    }else{
      console.log("发送失败",result.msg)
      ElMessage.error("邮箱已注册，请更换邮箱注册或重新登陆")
    }
  }catch (err){
    console.log("网络异常",err)
    ElMessage.error("网络异常"+err)
  }



}

// 密码复杂度校验
// const checkPassword = (rule:unknown, value:string, callback:Function) => {
//   const hasNumber = /\d/.test(value)
//   const hasLetter = /[a-zA-Z]/.test(value)
//   const hasSpecial = /[!@#$%^&*]/.test(value)
//   const validTypes = [hasNumber, hasLetter, hasSpecial].filter(Boolean).length
//
//
//   if (value.length < 6 || value.length > 18) {
//     callback(new Error('密码长度需为6-18位'))
//   } else if (validTypes < 2) {
//     callback(new Error('需包含数字、字母、特殊符号中的两种以上'))
//   } else {
//     callback()
//   }
// }


// 表单验证规则
const formRules = reactive({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入图形验证码', trigger: 'blur' },
    {validator:(rule:unknown, value:string, callback:Function)=>{

        value.toLowerCase() !==  captchaCode.value.toLowerCase()
            ? callback(new Error('图形验证码错误'))
            : callback()
      }

    }
  ],
  password: [
    { required: true,message:'请输入密码', trigger: 'blur' },
    {
      validator: (rule:unknown, value:string) => {
        if (value.length < 6 || value.length > 18) return false;

        // 定义字符类型检测正则
        const hasNumber = /\d/.test(value);          // 数字
        const hasLetter = /[a-zA-Z]/.test(value);    // 字母
        const hasSpecial = /[!@#$%^&*=+_-]/.test(value); // 特殊字符 !@#$%^&*=+-_

        // 统计符合的字符类型数量
        const typeCount = [hasNumber, hasLetter, hasSpecial]
            .filter(Boolean).length;
        //console.log(hasNumber,hasLetter,hasSpecial)
        return typeCount >= 2;

      },
      message: '需包含数字、字母、特殊符号中至少两种',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule:unknown, value:string ) => value === formData.password,
      message: '两次输入密码不一致',
      trigger: 'blur'
    }
  ],
  emailCode: [
    { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
    { validator:( rule:unknown, value:string, callback:Function)=>{
        value !== '123456'
            ? callback(new Error('邮箱验证码错误'))
            : callback()
      }
    }
  ]
})

interface registerResponse{
  userInfo?:UserProfile,
  token:string
}

const submitForm = async () => {
  //提交注册表单
  console.log('提交注册表单')
  try {
    const result=await apiRegister({email:realData.email,password:realData.password,username:"",bio:""}) as TransDef
    if(result.code===successCode){
      ElMessage.success(result.msg+"正在为您自动登录")
      router.push('/')
      const response= result?.data as unknown as registerResponse
      const userInfo=response?.userInfo ??{}
      userStore.setUser(userInfo)
      const token=response?.token ??''
      userToken.setToken(token)
      userStore.setLogin(true)
    }else{
      ElMessage.error(result.msg)
    }
  }catch (error){
    console.log('网络异常，注册失败')
  }

}
//注册可触发的状态改变事件
const emit  = defineEmits(['switchToLogin'])
const goLogin=()=>{
  //跳转到登录界面
  console.log('跳转到登录界面')
  emit('switchToLogin',true)
}




</script>


<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 class="register-title">用户注册</h2>
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          label-position="top"
      >
        <!-- 邮箱输入 -->
        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="formData.email"
              @blur="validateFormItem('email')"
              placeholder="请输入邮箱"
              prefix-icon="Message"
          />
        </el-form-item>




        <!-- 密码输入 -->
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="formData.password"
              type="password"
              @blur="validateFormItem('password')"
              placeholder="6-18位，需包含两种以上字符类型"
              show-password
          />
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="formData.confirmPassword"
              type="password"
              @blur="validateFormItem('confirmPassword')"
              placeholder="请再次输入密码"
              show-password
          />
        </el-form-item>

        <!-- 图形验证码 -->
        <!-- <el-form-item label="图形验证码" prop="captcha">
       <el-input
         v-model="formData.captcha"
         placeholder="请输入验证码"
         style="width: 60%"
       />
       <Identify
         class="captcha-img"
         :identifyCode="captchaCode"
         @click="refreshCaptcha"
          </el-form-item>
       /> -->


        <el-form-item label="图形验证码" prop="captcha">
          <el-input
              v-model="formData.captcha"
              @blur="validateFormItem('captcha')"
              placeholder="请输入验证码"
              style="width: 60%"
          />
          <Identify
              class="captcha-img"
              @updateCode="updateCode"
          />
        </el-form-item>




        <!-- 邮箱验证码 -->
        <el-form-item label="邮箱验证码" prop="emailCode">
          <el-input
              v-model="formData.emailCode"
              placeholder="请输入收到的验证码"
              @blur="validateFormItem('emailCode')"
              style="width: 60%"
          />
          <el-button
              :disabled="isvalid"
              @click="sendEmailCode"
              style="background-color: #42b983; color: white;"
          >
            {{ sendBtnText }}
          </el-button>
        </el-form-item>


        <el-button type="primary" :disabled="ifRegister" @click="submitForm">立即注册</el-button>
        <el-button  @click="goLogin">已有账号？去登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: flex-start; // 顶部对齐更符合移动端习惯
  justify-content: center;
  background: #f5f7fa; // 简化背景提升性能
  padding: 16px;

  .register-card {
    width: 100%;
    max-width: 100%; // 移动端全宽
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    ::v-deep .el-card__body {
      padding: 24px 16px;
    }
  }

  .register-title {
    text-align: center;
    color: #333;
    font-size: 22px;
    margin-bottom: 28px;
    font-weight: 600;
    position: relative;

    &::after {
      content: '';
      display: block;
      width: 48px;
      height: 2px;
      background: #409eff;
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .el-form {
    .el-form-item {
      margin-bottom: 20px;

      :deep(.el-form-item__label) {
        font-size: 14px !important;
        font-weight: 500;
        color: #666;
        padding-bottom: 6px;
      }

      .el-input {
        --el-input-height: 44px;
        --el-input-border-radius: 6px;
        --el-input-font-size: 16px;

        :deep(.el-input__inner) {
          padding: 0 12px;
        }

        &:hover :deep(.el-input__wrapper) {
          box-shadow: 0 0 0 1px #409eff inset;
        }
      }
    }

    // 验证码容器适配
    .el-form-item__content {
      display: flex;
      flex-direction: column; // 移动端垂直布局
      gap: 12px;

      > * {
        width: 100% !important; // 强制全宽
      }
    }

    .captcha-img {
      border: 1px solid #eee;
      border-radius: 6px;
      height: 40px !important; // 固定验证码高度
    }

    .el-button {
      width: 100% !important; // 按钮全宽
      height: 46px;
      font-size: 16px !important;
      border-radius: 6px;
      margin: 8px 0 !important;

      &--primary {
        background: linear-gradient(135deg, #409eff, #66b1ff);
        border: none;
        box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
      }

      + .el-button {
        margin-top: 12px !important; // 增加按钮间距
      }
    }
  }
}

/* 响应式适配 */
@media (max-width: 375px) {
  .register-container {
    padding: 12px;

    .register-card ::v-deep .el-card__body {
      padding: 20px 12px;
    }

    .register-title {
      font-size: 20px;
      margin-bottom: 24px;

      &::after {
        bottom: -10px;
      }
    }

    .el-form {
      .el-form-item {
        margin-bottom: 18px;

        :deep(.el-input__inner) {
          font-size: 15px !important;
          height: 42px !important;
        }
      }

      .el-button {
        height: 44px;
        font-size: 15px !important;
      }
    }
  }
}

/* 横屏适配 */
@media (max-height: 500px) and (orientation: landscape) {
  .register-container {
    align-items: flex-start;
    padding-top: 40px;
    min-height: 100vh;

    .register-card {
      margin-top: 20px;
    }
  }
}

/* 超大字体手机适配 */
@media (max-width: 414px) and (min-height: 800px) {
  .register-container {
    .register-title {
      font-size: 24px;
    }

    .el-form {
      :deep(.el-form-item__label) {
        font-size: 15px !important;
      }

      .el-input {
        --el-input-height: 48px;
      }
    }
  }
}
</style>

