<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue'
import { View, Hide } from '@element-plus/icons-vue'
import {apiLogin} from "@/api/authService.ts";
import {successCode} from "@/api/myAxios.ts";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
  import {useUserStore,useUserToken} from "@/store/modules/userStore.ts";
import type {UserProfile} from "@/types/user.ts";
import Cookies from 'js-cookie';
import JSEncrypt from 'jsencrypt';  // 引入加密库

const userStore=useUserStore()
const userToken=useUserToken()
const router=useRouter()
// 表单数据
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})


// 密钥配置（实际应从后端获取或配置中心读取）
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxyz...  // 实际公钥内容
-----END PUBLIC KEY-----`;

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7...  // 实际私钥内容
-----END PRIVATE KEY-----`;


// 加密函数（使用公钥加密）
const encryptPassword = (password: string): string => {
  // const encryptor = new JSEncrypt();
  // encryptor.setPublicKey(PUBLIC_KEY);  // 设置公钥
  // const encrypted = encryptor.encrypt(password);  // 加密方法
  // return encrypted || '';  // 加密失败返回空字符串（避免存储false）
  return password
}

// 解密函数（使用私钥解密）
const decryptPassword = (encryptedStr: string | undefined): string => {
  if (!encryptedStr) return '';  // 空值直接返回空
  try {
    const decryptor = new JSEncrypt();
    decryptor.setPrivateKey(PRIVATE_KEY);  // 设置私钥
    const decrypted = decryptor.decrypt(encryptedStr);  // 解密方法
    return decrypted || '';  // 解密失败返回空字符串
  } catch (error) {
    console.error('解密失败:', error);
    return '';
  }
}

onMounted(()=>{
  const cachedEmail = Cookies.get('email');
  const cachedPassword = Cookies.get('password');
  if (cachedEmail && cachedPassword) {
    //开始解密并填充
    console.log('开始解密并填充')
    loginForm.email = cachedEmail;
    // loginForm.password = decryptPassword(cachedPassword);  // 调用解密函数
    loginForm.password=cachedPassword
    loginForm.rememberMe = true;  // 自动勾选记住密码
  }else {
    console.log('填充失败')
    console.log(cachedEmail,cachedPassword)
  }
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
      whitespace: true // 防止纯空格输入
    },
    {
      min: 6,
      max: 18,
      message: '密码长度需在6到18位之间',
      trigger: 'blur'
    }
  ]
})
interface loginResponse{
  userInfo?:UserProfile,
  token:string
}
// 登录处理
const handleLogin =async () => {
  // 这里添加实际的登录逻辑
  console.log('请求登录')

  try {
    const result =await apiLogin({email:loginForm.email,password:loginForm.password})
    if(result.code===successCode){
      //成功登录处理逻辑，储存用户信息和记录登录状态
      console.log('登录成功',result.msg)
      ElMessage.success('登录成功')
      router.push('/')
      const response=result.data as unknown as loginResponse
      userStore.setUser(response.userInfo as unknown as UserProfile)
      userToken.setToken(response.token)
      userStore.setLogin(true)


      //检查是否记住密码，进行记住密码处理
      if(loginForm.rememberMe){
        //记住密码则将密码存储在cookie，储存七天
        console.log('开始存储密码')
        const encryptedPwd = encryptPassword(loginForm.password);
        console.log(encryptedPwd)
        Cookies.set('email',loginForm.email,{expires:7})
        Cookies.set('password',encryptedPwd,{expires:7})
      }else {
        // 未勾选则清除缓存
        console.log('开始清楚缓存')
        Cookies.remove('email');
        Cookies.remove('password');
      }
    }else{
      console.log('登录失败',result.msg)
      ElMessage.error('登录失败'+result.msg)

    }
  }catch (err){
    console.log("网络异常",err)
  }

}

// 忘记密码处理
const handleForgetPassword = () => {
  // 这里添加忘记密码逻辑
  console.log('跳转忘记密码流程')
}

// //定义可触发的状态改变事件
// const emit = defineEmits(['switchToRegister'])
// 切换注册
const switchToRegister = () => {
  // 这里可以触发注册组件切换
  router.push('/register'); // <--- 修改这里： 使用路由跳转
}
</script>
<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">用户登录</h2>
      </template>

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
              type="email"
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
    </el-card>
  </div>
</template>

<style scoped>
/* 基础布局调整 */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 顶部对齐 */

  padding: 20px;
  background: #f5f7fa; /* 简化背景 */
}

.login-card {
  width: 100%;
  max-width: 480px; /* 移动端最大宽度限制 */
  height: 100%;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.login-title {
  font-size: 28px;
  color: #333;
  margin: 15px 0;
}

/* 表单元素优化 */
:deep(.el-form-item__label) {
  font-size: 16px !important;
  padding-bottom: 8px !important;
}

.mobile-input {
  :deep(.el-input__inner) {
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
    padding: 0 15px;
  }
}

.password-eye {
  font-size: 20px;
  margin-right: 10px;
  padding: 5px;
}

/* 操作区域调整 */
.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;

  .el-checkbox {
    font-size: 14px;
  }

  .forget-link {
    font-size: 14px;
  }
}

.login-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 10px;
}

.register-guide {
  font-size: 14px;
  margin-top: 25px;
  color: #666;

  .el-link {
    font-size: 14px;
  }
}

/* 移动端特定适配 */
@media (max-width: 375px) {
  .login-container {
    padding: 15px;
  }

  .login-title {
    font-size: 24px;
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

@media (max-height: 600px) {
  .login-container {
    align-items: center;
    padding: 10px;
  }

  .login-card {
    margin-top: -30px;
  }
}
</style>