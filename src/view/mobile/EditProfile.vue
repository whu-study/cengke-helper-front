<script setup lang="ts">
import {ref, reactive, onMounted, computed} from 'vue';
import {useRouter} from 'vue-router';
import {useUserStore} from '@/store/modules/userStore'; // 导入用户 store
import type {UserProfile} from '@/types/user'; // 导入用户配置类型
import {ElMessage, ElForm, ElFormItem, ElInput, ElButton, ElCard, type FormItemRule} from 'element-plus';

const userStore = useUserStore();
const router = useRouter();

// 定义表单数据结构，仅包含可编辑字段
const formData = reactive({
  username: '',
  email: '',
  bio: '',
  avatar: '', // 用于头像 URL
});

const formRef = ref<InstanceType<typeof ElForm>>();
const isLoading = ref(false);

// 组件挂载时用当前用户数据填充表单
onMounted(async () => {
  if (userStore.userInfo && userStore.userInfo.id) {
    populateForm(userStore.userInfo);
  } else {
    // 如果 userInfo 不可用，尝试获取它
    // 如果页面刷新且 Pinia 状态未针对所有字段持久化，
    // 或者用户直接导航到此页面，则可能会发生这种情况。
    try {
      isLoading.value = true;
      await userStore.fetchUserProfile();
      populateForm(userStore.userInfo);
    } catch (error) {
      ElMessage.error('加载用户信息失败。');
      console.error("在编辑页加载用户配置失败:", error);
      await router.push({name: 'profile'});
    } finally {
      isLoading.value = false;
    }
  }
});

const populateForm = (profile: UserProfile) => {
  formData.username = profile.username;
  formData.email = profile.email;
  formData.bio = profile.bio || ''; // 确保 bio 不是 undefined
  formData.avatar = profile.avatar || ''; // 确保 avatar 不是 undefined
};

// 校验规则，与 RegisterPage 类似
const formRules = ref<Partial<Record<string, FormItemRule[]>>>({
//   username: [
//     { required: true, message: '请输入用户名', trigger: 'blur' },
//     { min: 3, max: 15, message: '用户名长度应为3到15个字符', trigger: 'blur' }, // [cite: 54]
//     { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' } // [cite: 54]
//   ],
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
  ],
  bio: [
    {max: 200, message: '简介不能超过200个字符', trigger: 'blur'}
  ]
//   avatar: [
//     { type: 'url', message: '请输入有效的图片URL', trigger: ['blur', 'change'] },
//     { pattern: /\.(jpeg|jpg|gif|png|webp)$/i, message: 'URL必须指向一个图片文件 (jpeg, jpg, gif, png, webp)', trigger: ['blur', 'change'] }
//   ]
});

// 计算属性，用于在表单无效或未更改时禁用提交按钮
const isSubmitDisabled = computed(() => {
  if (!userStore.userInfo) return true;
  // 检查是否有任何表单数据与原始用户信息不同
  const changed = formData.username !== userStore.userInfo.username ||
      formData.email !== userStore.userInfo.email ||
      formData.bio !== (userStore.userInfo.bio || '') ||
      formData.avatar !== (userStore.userInfo.avatar || '');
  return !changed; // 如果未更改则禁用
});


const submitForm = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch (errors) {
    ElMessage.error('请检查表单填写是否正确');
    console.log('表单校验失败:', errors);
    return;
  }

  isLoading.value = true;
  try {
    const updatedProfileData: Partial<UserProfile> = {
      id: userStore.userInfo.id, // 重要：更新时包含 ID
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
      avatar: formData.avatar,
    };
    // 注意：userStore.updateUserProfile 将在内部调用 apiUpdateUserProfile
    await userStore.updateUserProfile(updatedProfileData);
    userStore.fetchUserProfile()
  } catch (error: any) {
    // 错误已由 userStore.updateUserProfile 中的 ElMessage 处理
    // ElMessage.error(error.message || '更新个人资料失败，请稍后再试');
    console.error('更新个人资料失败:', error);
  } finally {
    isLoading.value = false;
    await router.push({name: 'profile'}); // 导航回个人资料页面
  }
};

const goBack = () => {
  router.back(); // 或 router.push({ name: 'profile' });
};

</script>

<template>
  <div class="edit-profile-container">
    <el-card class="edit-profile-card">
      <template #header>
        <div class="card-header">
          <span>编辑个人资料</span>
        </div>
      </template>

      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-position="top"
          v-loading="isLoading && !userStore.userInfo.id"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="formData.username"
              placeholder="请输入3-15位用户名（字母、数字、下划线）"/>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="formData.email"
              placeholder="请输入邮箱"/>
        </el-form-item>

        <el-form-item label="头像URL" prop="avatar">
          <el-input
              v-model="formData.avatar"
              placeholder="请输入图片URL"/>
          <div v-if="formData.avatar" class="avatar-preview-container">
            <p class="avatar-preview-label">当前头像预览:</p>
            <el-avatar shape="square" :size="100" :src="formData.avatar"/>
          </div>
        </el-form-item>

        <el-form-item label="简介" prop="bio">
          <el-input
              v-model="formData.bio"
              type="textarea"
              :rows="3"
              placeholder="选填，介绍一下自己吧..."/>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              @click="submitForm"
              :loading="isLoading"
              :disabled="isSubmitDisabled"
              style="width: 100%; margin-bottom: 10px;"
          >
            {{ isLoading ? '正在保存...' : (isSubmitDisabled ? '无更改' : '保存更改') }}
          </el-button>
          <el-button @click="goBack" style="width: 100%;">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.edit-profile-container {
  display: flex; // [cite: 74, 28]
  align-items: flex-start; // [cite: 74, 28]
  justify-content: center; // [cite: 74, 28]
  min-height: calc(100vh - 60px); // [cite: 28] /* 假设导航栏高度 */
  background: #f5f7fa; // [cite: 74, 29]
  padding: 20px; // [cite: 74, 29]
}

.edit-profile-card {
  width: 100%;
  max-width: 600px; // [cite: 29] /* 与 ProfilePage 一致 */
  border-radius: 12px; // [cite: 29]
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); // [cite: 76]

  :deep(.el-card__body) {
    padding: 24px 20px; // [cite: 77, 93, 94] /* 为稍微多一点的内边距进行了调整 */
  }
}

.card-header {
  font-size: 20px; // [cite: 30]
  font-weight: bold; // [cite: 30]
  text-align: center; // [cite: 30]
  color: #303133;
}

.el-form {
  .el-form-item {
    margin-bottom: 22px; // [cite: 80] /* 稍微大一点的间距 */
    :deep(.el-form-item__label) {
      font-size: 14px !important; // [cite: 80]
      font-weight: 500; // [cite: 80]
      color: #606266; // [cite: 80]
      padding-bottom: 8px; // [cite: 80]
    }

    .el-input, .el-textarea {
      --el-input-height: 44px; // [cite: 82]
      --el-input-border-radius: 6px; // [cite: 82]
      --el-input-font-size: 15px; // [cite: 82] 调整后

      :deep(.el-input__inner), :deep(.el-textarea__inner) {
        padding: 0 14px; // [cite: 83] 调整后
      }

      &:hover :deep(.el-input__wrapper), &:hover :deep(.el-textarea__inner) {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset; // [cite: 84] Element Plus 变量
      }
    }

    :deep(.el-textarea__inner) {
      padding: 8px 14px; // textarea 的特定内边距
    }
  }

  .avatar-preview-container {
    margin-top: 10px;

    .avatar-preview-label {
      font-size: 13px;
      color: #909399; // [cite: 35]
      margin-bottom: 5px;
    }
  }


  .el-button {
    width: 100% !important; // [cite: 89]
    height: 46px; // [cite: 89]
    font-size: 16px !important; // [cite: 89]
    border-radius: 6px; // [cite: 89]
    // margin: 8px 0 !important; // [cite: 89] // 由主按钮的直接样式处理

    &--primary {
      background: linear-gradient(135deg, #409eff, #66b1ff); // [cite: 90]
      border: none; // [cite: 90]
      box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2); // [cite: 91]
    }
  }
}

/* 与 RegisterPage 类似的响应式调整 */
// [cite: 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104]
@media (max-width: 375px) {
  .edit-profile-container {
    padding: 12px; // [cite: 93]
    .edit-profile-card :deep(.el-card__body) {
      padding: 20px 12px; // [cite: 93, 94]
    }

    .card-header {
      font-size: 18px; // [cite: 95] 调整后
    }

    .el-form {
      .el-form-item {
        margin-bottom: 18px; // [cite: 97]
        :deep(.el-input__inner), :deep(.el-textarea__inner) {
          font-size: 15px !important; // [cite: 98]
          // height 由 --el-input-height 控制
        }
      }

      .el-button {
        height: 44px; // [cite: 99]
        font-size: 15px !important; // [cite: 99]
      }
    }
  }
}
</style>