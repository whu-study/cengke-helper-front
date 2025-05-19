<script setup lang="ts">


import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import Identify from '@/components/login/IdentifyCode.vue'
import { webSendEmailVerifyCode, apiRegister } from '@/api/authService.ts'
import type { TransDef } from "@/api/myAxios.ts";
import { successCode } from "@/api/myAxios.ts";
import { useRouter } from "vue-router";
import { useUserStore, useUserToken } from "@/store/modules/userStore.ts";
import type { UserProfile } from "@/types/user.ts";

const userStore = useUserStore()
const userToken = useUserToken()
const router = useRouter()

// 1. 更新 ValidateFields 类型 (如果 username 也需要即时验证状态)
type ValidateFields = 'username' | 'email' | 'captcha' | 'emailCode' | 'password' | 'confirmPassword' // 添加 'username'

// 2. 更新 validate ref 对象 (如果 username 也需要即时验证状态)
const validate = ref<Record<ValidateFields, boolean>>({
  username: false, // 添加 username
  email: false,
  captcha: false,
  emailCode: false,
  password: false,
  confirmPassword: false
})

const realData = reactive({
  email: '',
  password: '',
  // username: '' // 通常用户名不需要在这里，因为不是发送验证码的依据
})
const formRef = ref()
const ifCanRegister = ref(false)

// 3. 表单数据: 添加 username
const formData = reactive({
  username: '', // 新增 username 字段
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
const isSending = ref(false)
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

// 是否允许发送验证码 (通常用户名不作为发送邮箱验证码的前置条件)
// isvalid 计算属性通常基于 email, captcha, password, confirmPassword 的验证状态
// 如果希望在填写用户名之前也不能发送验证码，则可以在下面加入 validate.value.username
const isvalid = computed(() => {
  return !(
    validate.value.username && // 如果要求填写用户名后才能发送验证码
    validate.value.email &&
    validate.value.captcha &&
    validate.value.password &&
    validate.value.confirmPassword &&
    !isSending.value
  )
})

// 是否允许注册按钮可用
const ifRegister = computed(() => {
  return !(
    validate.value.username && // 添加 username 的验证状态
    validate.value.email &&
    validate.value.password &&
    validate.value.confirmPassword &&
    validate.value.emailCode &&
    ifCanRegister.value // ifCanRegister 通常表示邮箱验证码已发送/验证通过
  )
})


const sendEmailCode = async () => {
  // 确保在发送邮件验证码之前，用户名、邮箱、密码等已通过基础校验
  // 例如，可以先校验用户名
  if (!formData.username) {
    ElMessage.error('请先输入用户名');
    return;
  }
  // 也可以在这里触发一次用户名的校验
  // await formRef.value?.validateField('username');
  // if (!validate.value.username) return;


  if (!formData.email) {
    ElMessage.error('请先输入邮箱')
    return
  }
  // ... (保留原有发送邮件逻辑)
  try {
    const result = await webSendEmailVerifyCode(formData.email) as TransDef

    if (result.code === successCode) {
      console.log("发送成功", result.msg)
      ElMessage.success(result.msg)
      realData.email = formData.email
      realData.password = formData.password
      // realData.username = formData.username // 如果也需要保存用户名
      ifCanRegister.value = true
      isSending.value = true
      let count = 60 // 通常设置为60秒
      const timer = setInterval(() => {
        sendBtnText.value = `${count}秒后重发`
        if (count-- <= 0) {
          clearInterval(timer)
          isSending.value = false
          sendBtnText.value = '获取验证码'
        }
      }, 1000)

    } else {
      console.log("发送失败", result.msg)
      ElMessage.error(result.msg || "发送邮箱验证码失败，请检查邮箱或稍后再试") // 给一个通用提示
    }
  } catch (err) {
    console.log("网络异常", err)
    ElMessage.error("网络异常，发送失败")
  }
}


// 4. 表单验证规则: 添加 username 的规则
const formRules = reactive({
  username: [ // 新增 username 验证规则
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '用户名长度应为3到15个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
    // 可以根据需要添加更多规则，例如异步校验用户名是否已存在
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入图形验证码', trigger: 'blur' },
    {
      validator: (rule: unknown, value: string, callback: Function) => {
        value.toLowerCase() !== captchaCode.value.toLowerCase()
          ? callback(new Error('图形验证码错误'))
          : callback()
      }
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      validator: (rule: unknown, value: string) => {
        if (value.length < 6 || value.length > 18) return false;
        const hasNumber = /\d/.test(value);
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasSpecial = /[!@#$%^&*=+_-]/.test(value);
        const typeCount = [hasNumber, hasLetter, hasSpecial].filter(Boolean).length;
        return typeCount >= 2;
      },
      message: '密码长度6-18位，需包含数字、字母、特殊符号中至少两种',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: unknown, value: string) => value === formData.password,
      message: '两次输入密码不一致',
      trigger: 'blur'
    }
  ],
  emailCode: [
    { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
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

  // 再次检查 realData 中的 email 和 password 是否与当前 formData 一致，
  // 防止用户在发送验证码后修改了这些关键信息而未重新发送验证码
  if (formData.email !== realData.email || formData.password !== realData.password) {
    ElMessage.error('邮箱或密码已更改，请重新发送验证码并校验');
    ifCanRegister.value = false; // 可能需要重置这个状态
    return;
  }


  console.log('提交注册表单');
  try {
    // 注意：apiRegister 的参数应该与后端API定义一致
    // 假设 apiRegister 接受 { email, password, username, emailCode, bio }
    // bio 字段当前为空字符串，如果不需要可以不传或按API要求处理
    const result = await apiRegister({
      email: realData.email, // 使用发送验证码时锁定的邮箱
      password: realData.password, // 使用发送验证码时锁定的密码
      username: formData.username, // 使用当前表单中的用户名
      emailCode: formData.emailCode, // 添加邮箱验证码到请求中
      avatar: "",
      bio: "" // 根据需要设置
    }) as TransDef;

    if (result.code === successCode) {
      ElMessage.success((result.msg || "注册成功！") + " 正在为您自动登录");
      router.push('/'); // 跳转到首页或其他目标页
      const response = result?.data as unknown as registerResponse;
      const userInfo = response?.userInfo ?? {};
      userStore.setUser(userInfo as UserProfile); // 确保类型正确
      const token = response?.token ?? '';
      userToken.setToken(token);
      userStore.setLogin(true);
    } else {
      ElMessage.error(result.msg || "注册失败，请稍后再试");
    }
  } catch (error) {
    console.log('网络异常，注册失败', error);
    ElMessage.error("网络异常，注册失败");
  }
}

const emit = defineEmits(['switchToLogin'])
const goLogin = () => {
  console.log('跳转到登录界面')
  // emit('switchToLogin',true) // 如果之前改成了路由跳转，这里也应该保持一致
  router.push('/login'); // 假设登录页路由是 /login
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
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="formData.username"
              @blur="validateFormItem('username')"
              placeholder="请输入3-15位用户名（字母、数字、下划线）"
              prefix-icon="User" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="formData.email"
              @blur="validateFormItem('email')"
              placeholder="请输入邮箱"
              prefix-icon="Message"
          />
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
              :disabled="isvalid"
              @click="sendEmailCode"
              style="background-color: #42b983; color: white;"
          >
            {{ sendBtnText }}
          </el-button>
        </el-form-item>

        <el-button type="primary" :disabled="ifRegister" @click="submitForm">立即注册</el-button>
        <el-button @click="goLogin">已有账号？去登录</el-button>
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

