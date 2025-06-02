<template>
  <div class="post-form-wrapper">
    <el-form
      ref="postFormRef"
      :model="postForm"
      :rules="formRules"
      label-position="top"
      class="post-form-inner"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="帖子标题" prop="title">
        <el-input
          v-model="postForm.title"
          placeholder="请输入帖子标题 (例如：探索 Vue 3 的奇妙之旅)"
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
          :rows="12"
          placeholder="请在此输入帖子的详细内容。支持 Markdown 格式 (如果您的后端解析并渲染 Markdown)。"
          clearable
          maxlength="10000"
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
          placeholder="输入标签后按回车创建, 如: Vue, 技术分享"
          class="tags-input"
          popper-class="tags-dropdown"
        >
          </el-select>
        <div class="tag-tip">输入新标签文字后按回车键即可创建。已选标签会显示在上方。</div>
      </el-form-item>

      <el-form-item class="form-actions">
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="isSubmittingInternal"
          round
          size="large"
          class="submit-button"
        >
          {{ submitButtonText }}
        </el-button>
        <el-button @click="handleResetForm" round size="large" v-if="!isEditMode">重置表单</el-button>
        <el-button @click="handleCancelEdit" round size="large" v-if="isEditMode">取消编辑</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import type { Post } from '@/types/discuss'; // 确保 Post 类型定义已存在
// 假设 CreatePostBody 和 UpdatePostBody 类型已在 postService.ts 中定义
// 如果没有，你需要从 postService.ts 导入或在这里定义类似的简化类型
import type { CreatePostBody, UpdatePostBody } from '@/api/postService';


// --- Props 定义 ---
const props = defineProps({
  isEditMode: {
    type: Boolean,
    default: false,
  },
  editingPost: {
    type: Object as () => Post | null,
    default: null,
  },
  isSubmitting: { // 父组件控制的提交状态
    type: Boolean,
    default: false,
  },
  initialTags: { // 新增 prop
    type: Array as () => string[],
    default: () => [],
  }
});

// --- Emits 定义 ---
// payload 现在是准备好给 API 的数据格式
export type FormSubmitPayload = CreatePostBody | UpdatePostBody;
const emit = defineEmits<{
  (e: 'submit-form', payload: FormSubmitPayload): void;
  (e: 'cancel-edit'): void;
}>();

// --- 表单数据和引用 ---
const postFormRef = ref<FormInstance>();
const postForm = reactive({
  title: '',
  content: '',
  tags: [] as string[],
});

// 内部提交状态，用于按钮 loading，由 prop.isSubmitting 控制
const isSubmittingInternal = computed(() => props.isSubmitting);

// --- 表单验证规则 ---
const formRules = reactive<FormRules>({
  title: [
    { required: true, message: '帖子标题不能为空', trigger: 'blur' },
    { min: 3, max: 100, message: '标题长度应在 3 到 100 个字符之间', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '帖子内容不能为空', trigger: 'blur' },
    { min: 10, message: '帖子内容至少需要 10 个字符', trigger: 'blur' },
  ],
  tags: [
    {
      validator: (_, value: string[], callback) => {
        if (value && value.some(tag => tag.length > 20)) {
          callback(new Error('单个标签长度不能超过20个字符'));
        } else {
          callback();
        }
      },
      trigger: 'change', // 或 'blur' on select
    }
  ]
});

const submitButtonText = computed(() => {
  if (props.isSubmitting) {
    return props.isEditMode ? '更新中...' : '发布中...';
  }
  return props.isEditMode ? '确认更新' : '立即发布';
});



// --- 生命周期钩子和侦听器 ---
onMounted(() => {
  if (props.isEditMode && props.editingPost) {
    populateForm(props.editingPost);
  }
});
watch(() => props.initialTags, (newTags) => {
  if (!props.isEditMode && newTags && newTags.length > 0) {
    // 仅在非编辑模式下，当 initialTags 变化时更新表单的 tags
    // 避免在编辑模式下，initialTags (如果父组件意外传递) 覆盖正在编辑的帖子的标签
    const currentTagsSet = new Set(postForm.tags);
    newTags.forEach(tag => currentTagsSet.add(tag));
    if (currentTagsSet.size <= 5) { // 假设标签上限为5
        postForm.tags = Array.from(currentTagsSet);
    } else {
        postForm.tags = Array.from(currentTagsSet).slice(0, 5);
        ElMessage.warning('自动添加的标签已达上限，部分预设标签可能未添加。');
    }
  }
}, { deep: true, immediate: true });
watch(() => props.editingPost, (newPostData) => {
  if (props.isEditMode) {
    populateForm(newPostData);
  } else if (!props.isEditMode && !newPostData) {
    // 如果从编辑模式切换回创建模式 (editingPost 变为 null)
    // populateForm(null) 会清空 title 和 content
    // 此时我们还需根据 initialTags 重设 tags
    populateForm(null);
    if (props.initialTags.length > 0) {
        postForm.tags = [...props.initialTags].slice(0,5); // 确保不超过上限
    }
  }
}, { deep: true }); // immediate 已在 initialTags 的 watch 中处理

// 在 populateForm 中，当 postData 为 null (非编辑模式清空时)
const populateForm = (postData: Post | null) => {
  if (postData) {
    postForm.title = postData.title;
    postForm.content = postData.content;
    postForm.tags = postData.tags ? [...postData.tags] : [];
  } else {
    postForm.title = '';
    postForm.content = '';
    // postForm.tags = []; // 不在这里清空 tags，让 initialTags 的 watch 或 onMounted 处理
                         // 或者如果确定 populateForm(null) 就是彻底重置，
                         // 则由调用方在调用后根据 initialTags 重新设置
  }
};


// --- 方法 ---
const handleSubmit = () => {
  if (!postFormRef.value) return;
  postFormRef.value.validate((valid) => {
    if (valid) {
      // 准备提交的数据，不包含 id (对于创建) 或其他后端管理的字段
      const formDataToEmit: FormSubmitPayload = {
        title: postForm.title,
        content: postForm.content,
        tags: [...postForm.tags], // 确保是副本
        // 如果 CreatePostBody/UpdatePostBody 还有其他字段，从 postForm 中获取
      };
      emit('submit-form', formDataToEmit);
    } else {
      ElMessage.error('请检查表单输入项是否都符合要求。');
    }
  });
};

const handleResetForm = () => {
  if (!postFormRef.value) return;
  if (props.isEditMode) {
    populateForm(props.editingPost);
    ElMessage.info('表单已恢复到初始编辑状态');
  } else {
    postFormRef.value.resetFields(); // 这个会清空 title, content
    postForm.tags = props.initialTags.length > 0 ? [...props.initialTags].slice(0,5) : []; // 根据 initialTags 重置
    ElMessage.info('表单已重置');
  }
};

const handleCancelEdit = () => {
  emit('cancel-edit');
};

// 暴露方法给父组件 (如果需要)
defineExpose({
  resetFormFields: () => { // 提供一个外部可调用的重置方法
    if (postFormRef.value) {
      postFormRef.value.resetFields();
      postForm.tags = [];
    }
  },
  setFormValues: (data: Post) => { // 提供一个外部可调用的设置表单值方法
     populateForm(data);
  }
});

</script>

<style scoped>
.post-form-wrapper {
  padding: clamp(16px, 3vw, 24px);
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  margin: 0 auto;
  max-width: 800px; /* 控制表单最大宽度 */
}

.post-form-inner .el-form-item {
  margin-bottom: clamp(18px, 2.5vw, 22px);
}

.post-form-inner .el-form-item__label {
  font-size: clamp(14px, 1.5vw, 16px);
  color: var(--el-text-color-primary);
  line-height: 1.5;
  padding-bottom: 8px !important; /* Element Plus 默认 label 有 padding-bottom */
}

/* 统一输入框样式 */
.post-form-inner .el-input__inner,
.post-form-inner .el-textarea__inner {
  font-size: clamp(14px, 1.4vw, 15px);
  border-radius: 4px;
}

.post-form-inner .el-input--large .el-input__inner {
  /* height: 40px; */ /* Element Plus size="large" 会自动调整 */
}

.tags-input {
  width: 100%;
}
.tags-input :deep(.el-select__tags-text) {
  font-size: clamp(13px, 1.3vw, 14px);
}
.tags-input :deep(.el-tag) {
  font-size: clamp(12px, 1.2vw, 13px);
  margin: 2px 4px 2px 0;
}
.tag-tip {
  font-size: clamp(12px, 1.2vw, 13px);
  color: var(--el-text-color-placeholder);
  margin-top: 5px;
}

.form-actions {
  margin-top: clamp(24px, 3vw, 30px);
  text-align: right; /* 按钮靠右 */
  display: flex;
  justify-content: flex-end; /* 确保按钮在 flex 容器中靠右 */
  gap: 12px; /* 按钮之间的间距 */
}

.form-actions .el-button {
  font-size: clamp(14px, 1.4vw, 15px);
  min-width: 100px;
}

.submit-button {
  /* 可以添加特定样式 */
}
</style>