<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'
import { apiLogin } from "@/api/authService.ts"
import { successCode } from "@/api/myAxios.ts"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { useUserStore, useUserToken } from "@/store/modules/userStore.ts"
import type { UserProfile } from "@/types/user.ts"
import {encryptPassword} from "@/utils/globalFunc.ts";
import {globalLoginPageNo} from "@/store/custom/globalData.ts";


const userStore = useUserStore()
const userToken = useUserToken()
const router = useRouter()

// 表单引用
const loginFormRef = ref<InstanceType<typeof import('element-plus/es')['ElForm']>>()

// 表单数据
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})
// 密码可见状态
const passwordVisible = ref(false)

// 表单验证规则
const loginRules = reactive({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
      whitespace: true
    },
    {
      min: 6,
      max: 18,
      message: '密码长度需在6到18位之间',
      trigger: 'blur'
    }
  ]
})

interface LoginResponse {
  userInfo?: UserProfile
  token: string
}

// 登录处理
const handleLogin = async () => {
  // 验证表单
  await loginFormRef.value?.validate((valid) => {
    if (!valid) return false
  })
  console.log('请求登录')
  // 使用加密后的密码
  const encryptedPassword = encryptPassword(loginForm.password)  // 新输入密码需要加密
  console.log("encryptedPassword: ",encryptedPassword)

  const result = await apiLogin({
    email: loginForm.email,
    password: encryptedPassword
  })
  if (result.code === successCode) {
    console.log('登录成功', result.msg)
    ElMessage.success('登录成功')

    const response = result.data as LoginResponse
    userStore.setUser(response.userInfo || {})
    userToken.setToken(response.token)
    userStore.setLogin(true)

    // 跳转到首页
    await nextTick(() => {
      router.push('/')
    })

  } else {
    console.log('登录失败', result.msg)
    ElMessage.error('登录失败: ' + result.msg)
  }
}

// 忘记密码处理
const handleForgetPassword = () => {
  console.log('跳转忘记密码流程')
  router.push('/forgot-password')
}

// 切换注册
const switchToRegister = () => {
  globalLoginPageNo.value = 1
}

onMounted(()=>{
})

</script>

<template>
      <el-form
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
          label-position="top"
      >
        <!-- 邮箱输入 -->
        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="loginForm.email"
              placeholder="请输入邮箱"
              clearable
              type="text"
              class="mobile-input"
          />
        </el-form-item>

        <!-- 密码输入 -->
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              :type="passwordVisible ? 'text' : 'password'"
              placeholder="请输入密码"
              class="mobile-input"
          >
            <template #suffix>
              <el-icon class="password-eye" @click="passwordVisible = !passwordVisible">
                <View v-if="passwordVisible" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 记住密码和忘记密码 -->
        <div class="mobile-actions">
          <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
          <el-link type="primary" class="forget-link" @click="handleForgetPassword">忘记密码？</el-link>
        </div>

        <!-- 登录按钮 -->
        <el-button
            type="primary"
            class="login-btn"
            @click="handleLogin"
        >
          立即登录
        </el-button>

        <!-- 注册引导 -->
        <div class="register-guide">
          没有账号？
          <el-link type="primary" @click="switchToRegister">立即注册</el-link>
        </div>
      </el-form>
</template>

<style scoped>
/* 基础布局调整 */

/* 表单元素优化 */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-size: 16px !important;
  font-weight: 500;
  color: #555;
  padding-bottom: 8px !important;
}

.mobile-input {
  :deep(.el-input__inner) {
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
    padding: 0 16px;
    border-color: #e4e7ed;

    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
    }
  }
}

.password-eye {
  font-size: 20px;
  margin-right: 10px;
  padding: 5px;
  cursor: pointer;
  color: #909399;

  &:hover {
    color: #409eff;
  }
}

/* 操作区域调整 */
.mobile-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0;

  .el-checkbox {
    font-size: 14px;
    color: #606266;
  }

  .forget-link {
    font-size: 14px;
    color: #409eff;

    &:hover {
      color: #66b1ff;
    }
  }
}

.login-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  margin-top: 16px;
  background-color: #409eff;
  border-color: #409eff;

  &:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
  }

  &:active {
    background-color: #3a8ee6;
    border-color: #3a8ee6;
  }
}

.register-guide {
  font-size: 14px;
  margin-top: 24px;
  color: #606266;
  text-align: center;

  .el-link {
    font-size: 14px;
    color: #409eff;
    margin-left: 4px;

    &:hover {
      color: #66b1ff;
    }
  }
}

/* 动画效果 */
.login-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

/* 移动端适配 */
@media (max-width: 576px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    padding: 24px;
    max-width: 90%;
  }

  .login-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .mobile-input :deep(.el-input__inner) {
    height: 44px;
    font-size: 15px;
  }

  .login-btn {
    height: 46px;
    font-size: 15px;
  }
}
</style>