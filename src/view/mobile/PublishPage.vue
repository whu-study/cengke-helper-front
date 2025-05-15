<template>
  <div class="create-post-form-container">
    <el-form
        ref="postFormRef"
        :model="postForm"
        :rules="formRules"
        label-position="top"
        class="post-form"
        @submit.prevent="submitForm"
    >
      <el-form-item label="帖子标题" prop="title">
        <el-input
            v-model="postForm.title"
            placeholder="请输入帖子标题 (例如：关于 Vue 3 的新发现)"
            clearable
            maxlength="100"
            show-word-limit
            size="large"
        />
      </el-form-item>

      <el-form-item label="帖子内容" prop="content">
        <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="10"
            placeholder="请在此输入帖子的详细内容，支持 Markdown 格式 (如果后端支持)..."
            clearable
            maxlength="5000"
            show-word-limit
            resize="vertical"
        />
      </el-form-item>

      <el-form-item label="帖子标签 (可选, 最多5个)" prop="tags">
        <el-select
            v-model="postForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            :multiple-limit="5"
            placeholder="输入标签后按回车创建, 如: Vue, 技术"
            class="tags-input"
            popper-class="tags-dropdown"
        >
        </el-select>
        <div class="tag-tip">输入标签文字后按回车键即可创建新标签。</div>
      </el-form-item>

      <el-form-item class="form-actions">
        <el-button type="primary" @click="submitForm" :loading="isSubmitting" round size="large">
          {{ isSubmitting ? (isEditMode ? '更新中...' : '发布中...') : (isEditMode ? '确认更新' : '立即发布') }}
        </el-button>
        <el-button @click="resetForm" round size="large" v-if="!isEditMode">重置表单</el-button>
        <el-button @click="cancelEdit" round size="large" v-if="isEditMode">取消编辑</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElNotification } from 'element-plus';
import type { Post } from '@/types/discuss'; // 确保 Post 类型定义已存在

// --- Props 定义 ---
const props = defineProps({
  /**
   * 是否为编辑模式
   * @type {boolean}
   * @default false
   */
  isEditMode: {
    type: Boolean,
    default: false,
  },
  /**
   * 在编辑模式下，传入的现有帖子数据
   * @type {Post | null}
   * @default null
   */
  editingPost: {
    type: Object as () => Post | null, // 使用函数形式以允许 null
    default: null,
  }
});

// --- Emits 定义 ---
const emit = defineEmits<{
  (e: 'post-created', payload: { id: string | number; title: string; content: string; tags: string[] }): void;
  (e: 'post-updated', payload: { id: string | number; title: string; content: string; tags: string[] }): void;
  (e: 'edit-cancelled'): void; // 当编辑被取消时触发
}>();

// --- 表单数据和引用 ---
const postFormRef = ref<FormInstance>();
const postForm = reactive({
  title: '',
  content: '',
  tags: [] as string[],
});
const isSubmitting = ref(false);

// --- 表单验证规则 ---
const formRules = reactive<FormRules>({
  title: [
    { required: true, message: '帖子标题不能为空', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在 5 到 100 个字符之间', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '帖子内容不能为空', trigger: 'blur' },
    { min: 20, message: '帖子内容至少需要 20 个字符', trigger: 'blur' },
  ],
});

// --- 辅助函数：用于填充表单数据 ---
const populateForm = (postData: Post | null) => {
  if (postData) {
    postForm.title = postData.title;
    postForm.content = postData.content;
    postForm.tags = postData.tags ? [...postData.tags] : []; // 创建副本以避免直接修改 prop
  } else {
    // 如果没有编辑数据 (例如从编辑模式切换回创建模式或初始创建)，则清空
    postForm.title = '';
    postForm.content = '';
    postForm.tags = [];
  }
};

// --- 生命周期钩子和侦听器 ---
onMounted(() => {
  if (props.isEditMode && props.editingPost) {
    populateForm(props.editingPost);
  }
});

watch(() => props.editingPost, (newPostData) => {
  if (props.isEditMode) {
    populateForm(newPostData);
  }
}, { deep: true, immediate: true }); // immediate: true 确保初始加载时也会执行


// --- 方法 ---
const submitForm = async () => {
  if (!postFormRef.value) return;

  await postFormRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true;
      const formData = JSON.parse(JSON.stringify(postForm)); // 深拷贝表单数据

      try {
        if (props.isEditMode && props.editingPost) {
          // --- 编辑模式：模拟更新 API 调用 ---
          console.log('更新帖子数据:', formData);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
          const updatedPost = {
            id: props.editingPost.id, // 使用原始帖子的ID
            ...formData,
          };
          ElNotification({
            title: '更新成功！',
            message: `帖子 "${updatedPost.title}" 已成功更新。`,
            type: 'success',
            duration: 3000,
          });
          emit('post-updated', updatedPost);
        } else {
          // --- 创建模式：模拟创建 API 调用 ---
          console.log('创建新帖子数据:', formData);
          await new Promise(resolve => setTimeout(resolve, 1500));
          const mockCreatedPost = {
            id: Date.now().toString(),
            ...formData,
          };
          ElNotification({
            title: '发布成功！',
            message: `帖子 "${mockCreatedPost.title}" 已成功发布。`,
            type: 'success',
            duration: 3000,
          });
          emit('post-created', mockCreatedPost);
          resetForm(); // 创建成功后重置表单
        }
      } catch (error) {
        console.error(props.isEditMode ? "更新帖子失败:" : "创建帖子失败:", error);
        ElMessage.error(props.isEditMode ? '帖子更新失败，请稍后再试。' : '帖子发布失败，请稍后再试。');
      } finally {
        isSubmitting.value = false;
      }
    } else {
      ElMessage.error('请检查表单输入项是否都符合要求。');
      return false;
    }
  });
};

const resetForm = () => {
  if (!postFormRef.value) return;
  postFormRef.value.resetFields();
  postForm.tags = []; // 确保标签也被清空
  if (!props.isEditMode) { // 仅在非编辑模式下提示重置
    ElMessage.info('表单已重置');
  }
};

const cancelEdit = () => {
  // 在编辑模式下，"取消编辑" 按钮触发此事件
  emit('edit-cancelled');
  // 可以选择是否重置表单为初始编辑数据
  if (props.editingPost) {
    populateForm(props.editingPost);
  }
  ElMessage.info('编辑已取消');
};

// 如果需要在父组件中调用此方法来填充表单 (例如，在 EditPostView 中获取数据后)
// defineExpose({
//   setFormData: (data: Post) => {
//     populateForm(data);
//   }
// });

</script>

<style scoped>
.create-post-form-container {
  padding: 3vw;
  background-color: #ffffff;
  border-radius: 2vw;
  margin: 0 auto;
  max-width: 900px;
}

.post-form .el-form-item {
  margin-bottom: 4vw;
}

.post-form .el-form-item__label {
  font-size: 4vw;
  color: #303133;
  line-height: 1.5;
  margin-bottom: 1.5vw !important;
}

.post-form .el-input__inner,
.post-form .el-textarea__inner {
  font-size: 3.8vw;
  padding: 2.5vw 3vw;
  border-radius: 1.5vw;
}
.post-form .el-input--large .el-input__inner{
  height: 12vw;
  line-height: 12vw;
}

.post-form .el-textarea__inner {
  padding: 2vw 3vw;
  line-height: 1.6;
}

.post-form .el-input.is-active .el-input__inner,
.post-form .el-input__inner:focus,
.post-form .el-textarea__inner:focus {
  border-color: #409EFF;
}

.tags-input {
  width: 100%;
}
.tags-input :deep(.el-select__tags-text) {
  font-size: 3.5vw;
}
.tags-input :deep(.el-tag) {
  font-size: 3.2vw;
  height: auto;
  padding: 1vw 1.5vw;
  margin: 0.5vw;
}
.tag-tip {
  font-size: 3vw;
  color: #909399;
  margin-top: 1vw;
}

.form-actions {
  margin-top: 5vw;
  text-align: center;
}

.form-actions .el-button {
  font-size: 4vw;
  padding: 3vw 6vw;
  margin: 0 2vw;
  min-width: 30vw;
}

@media (min-width: 768px) {
  .create-post-form-container {
    padding: 2vw;
    border-radius: 1vw;
  }
  .post-form .el-form-item {
    margin-bottom: 2.5vw;
  }
  .post-form .el-form-item__label {
    font-size: 1.5vw;
  }
  .post-form .el-input__inner,
  .post-form .el-textarea__inner {
    font-size: 1.3vw;
    padding: 1vw 1.2vw;
    border-radius: 0.8vw;
  }
  .post-form .el-input--large .el-input__inner{
    height: 3.5vw;
    line-height: 3.5vw;
  }
  .tags-input :deep(.el-select__tags-text) {
    font-size: 1.2vw;
  }
  .tags-input :deep(.el-tag) {
    font-size: 1.1vw;
  }
  .tag-tip {
    font-size: 1vw;
  }
  .form-actions .el-button {
    font-size: 1.4vw;
    padding: 1.2vw 2.5vw;
    min-width: 12vw;
  }
}
</style>
