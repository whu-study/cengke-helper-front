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

      <el-form-item label="帖子标签 (可选, 最多5个, 回车分隔)" prop="tags">
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
          {{ isSubmitting ? '发布中...' : '立即发布' }}
        </el-button>
        <el-button @click="resetForm" round size="large">重置表单</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
// 从 Vue 引入所需的 API
import { ref, reactive } from 'vue';
// 引入 Element Plus 表单相关的类型和组件实例类型
import type { FormInstance, FormRules } from 'element-plus';
// 引入 Element Plus 消息提示
import { ElMessage, ElNotification } from 'element-plus';
// 引入 Post 类型定义 (假设路径正确，如果需要提交的表单与Post类型部分一致)
// import type { Post } from '@/types/discuss'; // 如果需要更严格的类型

// --- Emits 定义 ---
// 定义组件可以触发的事件及其负载类型
const emit = defineEmits<{
  /**
   * 当帖子成功创建后触发
   * @param payload - 包含新创建的帖子数据 (或ID) 的对象
   */
  (e: 'post-created', payload: { id: string | number; title: string }): void; // 简单示例，可以传递完整 post 对象
}>();

// --- 表单数据和引用 ---
// 获取 el-form 组件的实例引用，用于后续调用表单方法 (如 validate, resetFields)
const postFormRef = ref<FormInstance>();

// 使用 reactive 创建帖子表单的响应式数据对象
const postForm = reactive({
  title: '',    // 帖子标题
  content: '',  // 帖子内容
  tags: [] as string[], // 帖子标签数组
});

// 标记是否正在提交表单，用于按钮的加载状态
const isSubmitting = ref(false);

// --- 表单验证规则 ---
// 定义表单各项的验证规则
const formRules = reactive<FormRules>({
  title: [
    { required: true, message: '帖子标题不能为空', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在 5 到 100 个字符之间', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '帖子内容不能为空', trigger: 'blur' },
    { min: 20, message: '帖子内容至少需要 20 个字符', trigger: 'blur' },
  ],
  tags: [
    // { type: 'array', max: 5, message: '最多只能添加 5 个标签', trigger: 'change' } // el-select multiple-limit 已处理
  ]
});

// (可选) 预定义标签数据
// const predefinedTags = ref([
//   { value: '技术', label: '技术' },
//   { value: '生活', label: '生活' },
//   { value: '问答', label: '问答' },
// ]);

// --- 方法 ---

/**
 * 提交表单
 * 该方法会首先验证表单，如果验证通过，则模拟API调用并处理结果。
 */
const submitForm = async () => {
  if (!postFormRef.value) return; //确保表单实例存在

  // 调用 el-form 实例的 validate 方法进行表单验证
  await postFormRef.value.validate(async (valid, fields) => {
    if (valid) { // 如果表单验证通过
      isSubmitting.value = true; // 开始提交，设置加载状态
      console.log('表单数据:', JSON.parse(JSON.stringify(postForm))); // 打印表单数据以供调试

      try {
        // --- 模拟调用 postService 与后端 API 交互 ---
        // 在实际应用中，这里应该调用一个服务方法，例如:
        // const newPostData = { title: postForm.title, content: postForm.content, tags: postForm.tags };
        // const response = await postService.createPost(newPostData);
        // const createdPost = response.data; // 假设后端返回创建的帖子数据

        await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟网络延迟

        // 假设帖子创建成功，后端返回了新帖子的ID和标题
        const mockCreatedPost = {
          id: Date.now().toString(), // 使用时间戳作为模拟ID
          title: postForm.title,
          // ... 其他可能从后端返回的字段
        };

        // 使用 ElNotification 显示成功通知
        ElNotification({
          title: '发布成功！',
          message: `帖子 "${mockCreatedPost.title}" 已成功发布。`,
          type: 'success',
          duration: 3000, // 持续时间
        });

        // 触发 'post-created' 事件，通知父组件帖子已创建
        emit('post-created', mockCreatedPost);

        // 成功后重置表单
        resetForm();

      } catch (error) {
        console.error("创建帖子失败:", error);
        // API 调用失败，显示错误消息
        ElMessage.error('帖子发布失败，请稍后再试或联系管理员。');
      } finally {
        isSubmitting.value = false; // 结束提交，解除加载状态
      }
    } else {
      console.log('表单验证失败:', fields);
      ElMessage.error('请检查表单输入项是否都符合要求。');
      return false; // 验证失败，不继续执行
    }
  });
};

/**
 * 重置表单
 * 调用 el-form 实例的 resetFields 方法清空表单数据和验证状态。
 */
const resetForm = () => {
  if (!postFormRef.value) return;
  postFormRef.value.resetFields(); // 重置表单字段
  postForm.tags = []; // 手动清空 tags，因为 el-select multiple 可能不会被 resetFields 完全清空
  ElMessage.info('表单已重置');
};

</script>

<style scoped>
.create-post-form-container {
  padding: 3vw; /* 容器内边距 */
  background-color: #ffffff; /* 背景色 */
  border-radius: 2vw; /* 圆角 */
  /* box-shadow: 0 0.5vw 1.5vw rgba(0, 0, 0, 0.07); */ /* 轻微阴影，如果作为独立页面可以考虑 */
  margin: 0 auto; /* 如果是页面主体，可以居中 */
  max-width: 900px; /* 在大屏幕上限制最大宽度 */
}

.post-form {
  /* 表单整体样式 */
}

.post-form .el-form-item {
  margin-bottom: 4vw; /* 表单项之间的垂直间距 */
}

.post-form .el-form-item__label {
  font-size: 4vw; /* 标签字号 */
  color: #303133;
  line-height: 1.5;
  margin-bottom: 1.5vw !important; /* 调整标签和输入框的间距 */
}

.post-form .el-input__inner,
.post-form .el-textarea__inner {
  font-size: 3.8vw; /* 输入框内文字大小 */
  padding: 2.5vw 3vw; /* 输入框内边距 */
  border-radius: 1.5vw; /* 输入框圆角 */
}
.post-form .el-input--large .el-input__inner{
  height: 12vw; /* 调整大号输入框高度 */
  line-height: 12vw;
}

.post-form .el-textarea__inner {
  padding: 2vw 3vw; /* 文本域内边距 */
  line-height: 1.6;
}

.post-form .el-input.is-active .el-input__inner,
.post-form .el-input__inner:focus,
.post-form .el-textarea__inner:focus {
  border-color: #409EFF; /* Element Plus 主题色 */
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
  margin-top: 5vw; /* 操作按钮区域与上方元素的间距 */
  text-align: center; /* 按钮居中 (如果需要) */
}

.form-actions .el-button {
  font-size: 4vw; /* 按钮字号 */
  padding: 3vw 6vw; /* 按钮内边距，使其更大更易点击 */
  margin: 0 2vw; /* 按钮之间的水平间距 */
  min-width: 30vw; /* 按钮最小宽度 */
}

/* 针对平板等稍大屏幕的调整 */
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
