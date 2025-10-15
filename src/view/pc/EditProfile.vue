<template>
  <div class="pc-edit-profile-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">编辑个人资料</h1>
          <p class="page-subtitle">完善个人信息，展示更好的自己</p>
        </div>
        <div class="header-right">
          <el-button :icon="ArrowLeft" @click="goBack" type="info" plain>
            返回
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧内容 - 编辑表单 -->
      <div class="content-main">
        <el-card class="edit-form-card" shadow="never">
          <template #header>
            <h2>基本信息</h2>
          </template>

          <el-form
            ref="formRef"
            :model="profileForm"
            :rules="formRules"
            label-width="100px"
            size="large"
            class="profile-form"
          >
            <!-- 头像上传 -->
            <el-form-item label="头像">
              <div class="avatar-upload">
                <el-upload
                  class="avatar-uploader"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                  :on-success="handleAvatarSuccess"
                  action="#"
                  :auto-upload="false"
                >
                  <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="avatar-tips">
                  <p>点击上传头像</p>
                  <p class="tip-text">支持 jpg、png 格式，文件大小不超过 2MB</p>
                </div>
              </div>
            </el-form-item>

            <!-- 用户名 -->
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="profileForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
                clearable
              />
            </el-form-item>

            <!-- 邮箱 -->
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="profileForm.email"
                placeholder="请输入邮箱地址"
                :prefix-icon="Message"
                clearable
              />
            </el-form-item>

            <!-- 个人简介 -->
            <el-form-item label="个人简介" prop="bio">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                placeholder="介绍一下自己吧..."
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <!-- 性别 -->
            <el-form-item label="性别">
              <el-radio-group v-model="profileForm.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="other">其他</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 生日 -->
            <el-form-item label="生日">
              <el-date-picker
                v-model="profileForm.birthday"
                type="date"
                placeholder="选择生日"
                style="width: 100%"
              />
            </el-form-item>

            <!-- 所在地 -->
            <el-form-item label="所在地">
              <el-input
                v-model="profileForm.location"
                placeholder="请输入所在地"
                :prefix-icon="Location"
                clearable
              />
            </el-form-item>

            <!-- 职业 -->
            <el-form-item label="职业">
              <el-input
                v-model="profileForm.occupation"
                placeholder="请输入职业"
                clearable
              />
            </el-form-item>

            <!-- 个人网站 -->
            <el-form-item label="个人网站">
              <el-input
                v-model="profileForm.website"
                placeholder="请输入个人网站地址"
                :prefix-icon="Link"
                clearable
              />
            </el-form-item>

            <!-- 社交媒体 -->
            <el-form-item label="社交媒体">
              <div class="social-inputs">
                <el-input
                  v-model="profileForm.social.github"
                  placeholder="GitHub用户名"
                  class="social-input"
                >
                  <template #prepend>GitHub</template>
                </el-input>
                <el-input
                  v-model="profileForm.social.weibo"
                  placeholder="微博用户名"
                  class="social-input"
                >
                  <template #prepend>微博</template>
                </el-input>
              </div>
            </el-form-item>

            <!-- 隐私设置 -->
            <el-form-item label="隐私设置">
              <div class="privacy-settings">
                <el-checkbox v-model="profileForm.privacy.showEmail">公开邮箱</el-checkbox>
                <el-checkbox v-model="profileForm.privacy.showBirthday">公开生日</el-checkbox>
                <el-checkbox v-model="profileForm.privacy.showLocation">公开所在地</el-checkbox>
                <el-checkbox v-model="profileForm.privacy.allowMessage">允许私信</el-checkbox>
              </div>
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item>
              <div class="form-actions">
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
                  保存修改
                </el-button>
                <el-button @click="handleReset">重置</el-button>
                <el-button @click="goBack" plain>取消</el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 右侧边栏 -->
      <div class="content-sidebar">
        <!-- 预览卡片 -->
        <el-card class="preview-card" shadow="hover">
          <template #header>
            <h3>个人资料预览</h3>
          </template>
          <div class="profile-preview">
            <div class="preview-avatar">
              <el-avatar :size="80" :src="profileForm.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
            </div>
            <div class="preview-info">
              <h3 class="preview-username">{{ profileForm.username || '用户名' }}</h3>
              <p class="preview-bio">{{ profileForm.bio || '这个人很懒，什么都没留下...' }}</p>
              <div class="preview-details">
                <div v-if="profileForm.location" class="detail-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ profileForm.location }}</span>
                </div>
                <div v-if="profileForm.occupation" class="detail-item">
                  <el-icon><Briefcase /></el-icon>
                  <span>{{ profileForm.occupation }}</span>
                </div>
                <div v-if="profileForm.website" class="detail-item">
                  <el-icon><Link /></el-icon>
                  <span>{{ profileForm.website }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 编辑提示 -->
        <el-card class="tips-card" shadow="hover">
          <template #header>
            <h3>编辑提示</h3>
          </template>
          <div class="tips-content">
            <div class="tip-item">
              <el-icon class="tip-icon"><InfoFilled /></el-icon>
              <div class="tip-text">
                <h4>完善个人资料的好处</h4>
                <p>完整的个人资料可以提高其他用户对你的信任度，增加互动机会。</p>
              </div>
            </div>
            <div class="tip-item">
              <el-icon class="tip-icon"><Lock /></el-icon>
              <div class="tip-text">
                <h4>隐私保护</h4>
                <p>你可以控制哪些信息对其他用户公开，保护个人隐私。</p>
              </div>
            </div>
            <div class="tip-item">
              <el-icon class="tip-icon"><Picture /></el-icon>
              <div class="tip-text">
                <h4>头像建议</h4>
                <p>使用清晰、友善的头像可以给其他用户留下良好的第一印象。</p>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 账号安全 -->
        <el-card class="security-card" shadow="hover">
          <template #header>
            <h3>账号安全</h3>
          </template>
          <div class="security-actions">
            <el-button :icon="Key" @click="changePassword" block plain>
              修改密码
            </el-button>
            <el-button :icon="Warning" @click="manageSecurity" block plain>
              安全设置
            </el-button>
            <el-button :icon="Download" @click="exportData" block plain>
              导出数据
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/userStore';
import type { FormInstance, FormRules } from 'element-plus';
import {
  ArrowLeft,
  User,
  Message,
  Location,
  Link,
  Plus,
  InfoFilled,
  Lock,
  Picture,
  Key,
  Warning,
  Download,
  Briefcase
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

// 表单引用
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

// 表单数据
const profileForm = reactive({
  avatar: '',
  username: '',
  email: '',
  bio: '',
  gender: '',
  birthday: '',
  location: '',
  occupation: '',
  website: '',
  social: {
    github: '',
    weibo: ''
  },
  privacy: {
    showEmail: false,
    showBirthday: false,
    showLocation: true,
    allowMessage: true
  }
});

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过200个字符', trigger: 'blur' }
  ]
};

// 方法
const goBack = () => {
  router.go(-1);
};

const beforeAvatarUpload = (file: any) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
};

const handleAvatarSuccess = (response: any) => {
  // 处理头像上传成功
  profileForm.avatar = response.url;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    // 模拟保存数据
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('个人资料保存成功！');
    router.push('/profile');
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    submitLoading.value = false;
  }
};

const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  // 重新加载用户信息
  loadUserProfile();
};

const changePassword = () => {
  ElMessage.info('跳转到修改密码页面');
  // 这里可以打开修改密码的对话框或跳转到相应页面
};

const manageSecurity = () => {
  ElMessage.info('跳转到安全设置页面');
};

const exportData = async () => {
  try {
    await ElMessageBox.confirm('确定要导出个人数据吗？', '数据导出', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });
    
    ElMessage.success('数据导出请求已提交，稍后将发送到您的邮箱');
  } catch {
    // 用户取消了操作
  }
};

const loadUserProfile = () => {
  if (userStore.userInfo) {
    const userInfo = userStore.userInfo;
    profileForm.avatar = userInfo.avatar || '';
    profileForm.username = userInfo.username || '';
    profileForm.email = userInfo.email || '';
    profileForm.bio = userInfo.bio || '';
    // 其他字段根据实际用户数据结构填充
  }
};

// 生命周期
onMounted(() => {
  if (!userStore.ifLogin) {
    ElMessage.warning('请先登录');
    router.push('/profile');
    return;
  }
  
  loadUserProfile();
});
</script>

<style scoped lang="scss">
.pc-edit-profile-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 0;
  margin-bottom: 25px;
  border-radius: 12px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;

    .header-left {
      .page-title {
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 8px 0;
      }

      .page-subtitle {
        font-size: 16px;
        opacity: 0.9;
        margin: 0;
      }
    }

    .header-right {
      .el-button {
        .el-icon {
          margin-right: 5px;
        }
      }
    }
  }
}

.main-content {
  display: flex;
  gap: 25px;
  align-items: flex-start;
}

.content-main {
  flex: 1;
  min-width: 0;

  .edit-form-card {
    :deep(.el-card__header) {
      padding: 20px 25px;
      border-bottom: 1px solid #f0f0f0;

      h2 {
        margin: 0;
        font-size: 20px;
        color: #303133;
        font-weight: 600;
      }
    }

    :deep(.el-card__body) {
      padding: 25px;
    }

    .profile-form {
      max-width: 600px;

      .avatar-upload {
        display: flex;
        align-items: center;
        gap: 20px;

        .avatar-uploader {
          :deep(.el-upload) {
            border: 1px dashed #d9d9d9;
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
            }
          }

          .avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 80px;
            height: 80px;
            text-align: center;
            line-height: 80px;
          }

          .avatar {
            width: 80px;
            height: 80px;
            display: block;
          }
        }

        .avatar-tips {
          p {
            margin: 0 0 5px 0;
            
            &.tip-text {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }

      .social-inputs {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .social-input {
          width: 100%;
        }
      }

      .privacy-settings {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;

        .el-checkbox {
          margin-right: 0;
        }
      }

      .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-start;
      }
    }
  }
}

.content-sidebar {
  width: 300px;
  flex-shrink: 0;

  .el-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.el-card__header) {
      padding: 15px 20px;
      border-bottom: 1px solid #f0f0f0;

      h3 {
        margin: 0;
        font-size: 16px;
        color: #303133;
        font-weight: 600;
      }
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .preview-card {
    .profile-preview {
      text-align: center;

      .preview-avatar {
        margin-bottom: 15px;
      }

      .preview-info {
        .preview-username {
          font-size: 18px;
          color: #303133;
          margin: 0 0 10px 0;
        }

        .preview-bio {
          color: #606266;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 15px 0;
        }

        .preview-details {
          .detail-item {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            margin-bottom: 8px;
            font-size: 13px;
            color: #909399;

            &:last-child {
              margin-bottom: 0;
            }

            .el-icon {
              font-size: 14px;
            }
          }
        }
      }
    }
  }

  .tips-card {
    .tips-content {
      .tip-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .tip-icon {
          font-size: 18px;
          color: #409eff;
          margin-right: 12px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .tip-text {
          flex: 1;

          h4 {
            margin: 0 0 5px 0;
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }

          p {
            margin: 0;
            font-size: 12px;
            color: #606266;
            line-height: 1.5;
          }
        }
      }
    }
  }

  .security-card {
    .security-actions {
      .el-button {
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        .el-icon {
          margin-right: 5px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .main-content {
    gap: 20px;
  }

  .content-sidebar {
    width: 280px;
  }
}

@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }

  .content-sidebar {
    width: 100%;

    .el-card {
      display: inline-block;
      width: calc(50% - 10px);
      margin-right: 20px;
      vertical-align: top;

      &:nth-child(even) {
        margin-right: 0;
      }
    }
  }

  .profile-form {
    .privacy-settings {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    .header-content {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }
  }

  .content-sidebar {
    .el-card {
      display: block;
      width: 100%;
      margin-right: 0;
      margin-bottom: 15px;
    }
  }

  .avatar-upload {
    flex-direction: column;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;

    .el-button {
      width: 100%;
    }
  }
}
</style>