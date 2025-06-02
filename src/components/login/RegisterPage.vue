<script setup lang="ts">
import {ref, reactive, computed} from 'vue'
import Identify from '@/components/login/IdentifyCode.vue'
import {webSendEmailVerifyCode, apiRegister} from '@/api/authService.ts'
import type {TransDef} from "@/api/type.ts";
import {successCode} from "@/api/myAxios.ts";
import {useRouter} from "vue-router";
import {useUserStore, useUserToken} from "@/store/modules/userStore.ts";
import type {UserProfile} from "@/types/user.ts";
import {encryptPassword} from "@/utils/globalFunc.ts";
import {globalLoginPageNo} from "@/store/custom/globalData.ts";

const userStore = useUserStore()
const userToken = useUserToken()
const router = useRouter()

type ValidateFields = 'username' | 'email' | 'captcha' | 'emailCode' | 'password' | 'confirmPassword' // 添加 'username'

const validate = ref<Record<ValidateFields, boolean>>({
  username: false,
  email: false,
  captcha: false,
  emailCode: false,
  password: false,
  confirmPassword: false
})

const formRef = ref()

const formData = reactive({
  username: '',
  email: '',
  captcha: '',
  emailCode: '',
  password: '',
  confirmPassword: ''
})

// 图形验证码相关
const captchaCode = ref('')

const updateCode = (code: string) => {
  captchaCode.value = code
  console.log(captchaCode.value)
}

// 邮箱验证码发送
const ifWaitingEmailCode = ref(false)
const sendBtnText = ref('获取验证码')

const validateFormItem = (field: ValidateFields) => {
  formRef.value?.validateField(field).then(() => {
    validate.value[field] = true;
  }).catch((err: Error) => {
    console.log('触发错误');
    console.log(err);
    validate.value[field] = false;
  });
}

// 是否允许注册按钮可用
const ifRegister = computed(() => {
  return !(
      validate.value.username && // 添加 username 的验证状态
      validate.value.email &&
      validate.value.password &&
      validate.value.confirmPassword &&
      validate.value.emailCode
  )
})


const sendEmailCode = async () => {
  if (!formData.email||!validate.value.email) {
    ElMessage.error('请先输入合法的邮箱')
    return
  }
  ifWaitingEmailCode.value = true

  const result = await webSendEmailVerifyCode(formData.email) as TransDef
  if (result.code !== successCode) {
    return
  }
  console.log("发送成功", result.msg)
  ElMessage.success(result.msg)
  let count = 60 // 通常设置为60秒
  const timer = setInterval(() => {
    sendBtnText.value = `${count}秒后重发`
    if (count-- <= 0) {
      clearInterval(timer)
      ifWaitingEmailCode.value = false
      sendBtnText.value = '获取验证码'
    }
  }, 1000)

}


// 4. 表单验证规则: 添加 username 的规则
const formRules = reactive({
  username: [ // 新增 username 验证规则
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 15, message: '用户名长度应为3到15个字符', trigger: 'blur'},
    {pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur'}
    // 可以根据需要添加更多规则，例如异步校验用户名是否已存在
  ],
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
  ],
  captcha: [
    {required: true, message: '请输入图形验证码', trigger: 'blur'},
    {
      validator: (_: unknown, value: string, callback: Function) => {
        value.toLowerCase() !== captchaCode.value.toLowerCase()
            ? callback(new Error('图形验证码错误'))
            : callback()
      }
    }
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {
      validator: (_: unknown, value: string) => {
        if (value.length < 6 || value.length > 18) return false;
        const hasNumber = /\d/.test(value);
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasSpecial = /[!@#$%^&*=+_-]/.test(value);
        const typeCount = [hasNumber, hasLetter, hasSpecial].filter(Boolean).length;
        //  const typeCount = [hasNumber].filter(Boolean).length;
        return typeCount >= 1;
      },
      message: '密码长度6-18位',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    {required: true, message: '请确认密码', trigger: 'blur'},
    {
      validator: (_: unknown, value: string) => value === formData.password,
      message: '两次输入密码不一致',
      trigger: 'blur'
    }
  ],
  emailCode: [
    {required: true, message: '请输入邮箱验证码', trigger: 'blur'},
    // 实际项目中邮箱验证码应该由后端校验，前端的 '123456' 仅为示例
    // {
    //   validator:( rule:unknown, value:string, callback:Function)=>{
    //      value !== '123456' // 假设 '123456' 是测试用的固定验证码
    //         ? callback(new Error('邮箱验证码错误'))
    //         : callback()
    //   }
    // }
  ]
})

interface registerResponse {
  userInfo?: UserProfile,
  token: string
}

// 5. 提交表单逻辑: 在 apiRegister 中加入 username
const submitForm = async () => {
  // 在提交前，确保所有字段都已校验通过
  try {
    await formRef.value?.validate(); // 校验整个表单
  } catch (errors) {
    ElMessage.error('请检查表单填写是否正确');
    console.log('表单校验失败:', errors);
    return;
  }


  console.log('提交注册表单');
  // 注意：apiRegister 的参数应该与后端API定义一致
  // 假设 apiRegister 接受 { email, password, username, emailCode, bio }
  // bio 字段当前为空字符串，如果不需要可以不传或按API要求处理
  const result = await apiRegister({
    email: formData.email,
    password: encryptPassword(formData.password),
    username: formData.username, // 使用当前表单中的用户名
    emailCode: formData.emailCode, // 添加邮箱验证码到请求中
    avatar: "",
    bio: "" // 根据需要设置
  }) as TransDef;

  if (result.code === successCode) {
    ElMessage.success((result.msg || "注册成功！") + " 正在为您自动登录");
    await router.push('/'); // 跳转到首页或其他目标页
    const response = result?.data as unknown as registerResponse;
    const userInfo = response?.userInfo ?? {};
    userStore.setUser(userInfo as UserProfile); // 确保类型正确
    const token = response?.token ?? '';
    userToken.setToken(token);
    userStore.setLogin(true);
  } else {
    ElMessage.error(result.msg || "注册失败，请稍后再试");
  }
}

const emit = defineEmits(['switchToLogin'])
const goLogin = () => {
  console.log('跳转到登录界面')
  // emit('switchToLogin',true) // 如果之前改成了路由跳转，这里也应该保持一致
  globalLoginPageNo.value = 0
}
</script>


<template>
<!--  <div class="register-container">-->
<!--    <el-card >-->
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="formData.username"
              @blur="validateFormItem('username')"
              placeholder="请输入3-15位用户名（字母、数字、下划线）"/>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="formData.email"
              @blur="validateFormItem('email')"
              placeholder="请输入邮箱"/>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="formData.password"
              type="password"
              @blur="validateFormItem('password')"
              placeholder="6-18位，需包含两种以上字符类型"
              show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="formData.confirmPassword"
              type="password"
              @blur="validateFormItem('confirmPassword')"
              placeholder="请再次输入密码"
              show-password
          />
        </el-form-item>

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

        <el-form-item label="邮箱验证码" prop="emailCode">
          <el-input
              v-model="formData.emailCode"
              placeholder="请输入收到的验证码"
              @blur="validateFormItem('emailCode')"
              style="width: 60%"
          />
          <el-button
              :disabled="ifWaitingEmailCode"
              @click="sendEmailCode"
              :loading="ifWaitingEmailCode"
              type="success"
          >
            {{ sendBtnText }}
          </el-button>
        </el-form-item>

        <el-button :type="ifRegister?'info':'primary'" :disabled="ifRegister" @click="submitForm">
          {{ ifRegister ? '完善表单后注册' : '立即注册' }}
        </el-button>
        <el-button @click="goLogin">已有账号？去登录</el-button>
      </el-form>
<!--    </el-card>-->
<!--  </div>-->
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

    :deep(.el-card__body) {
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

    // 修复：将 .el-button 样式移到正确的嵌套层级
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

    .register-card :deep(.el-card__body) {
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
