// CourseReviewForm.txt
<script setup lang="ts">
// ... (脚本部分保持不变) ...
// [Source 1-13]
import { ref, reactive, defineProps, defineEmits } from 'vue';
import { ElForm, ElFormItem, ElInput, ElRate, ElButton, ElMessage, ElCard } from 'element-plus'; // 确保 ElCard 已导入
import type { FormInstance, FormRules } from 'element-plus';
import { submitCourseReview } from '@/api/courseService';
import type { CourseReviewPayload } from '@/types/course';
import { successCode } from "@/api/myAxios";
import { useUserStore } from '@/store/modules/userStore';
const userStore = useUserStore();
const props = defineProps<{
  courseId: string | number | null;
}>();

const emit = defineEmits(['reviewSubmitted', 'cancel']);

const reviewFormRef = ref<FormInstance>();
const reviewFormData = reactive<Omit<CourseReviewPayload, 'courseId'>>({
  rating: 0,
  comment: '',
});
const isLoading = ref(false);

const rules = reactive<FormRules<typeof reviewFormData>>({
  rating: [
    { required: true, message: '请为课程评分', trigger: 'change' },
    { type: 'number', min: 1, message: '评分至少为1星', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入课程评论', trigger: 'blur' },
    { min: 1, max: 500, message: '评论内容长度应为 1 到 500 个字符', trigger: 'blur' }, // 之前是min:5，参照用户提供的改为1
  ],
});

const handleSubmitReview = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  if (!props.courseId) {
    ElMessage.error('未指定课程ID，无法提交评价');
    return;
  }

  await formEl.validate(async (valid) => {
    if (valid) {
      isLoading.value = true;
      try {
        const payload: CourseReviewPayload = {
          courseId: props.courseId!,
          rating: reviewFormData.rating,
          comment: reviewFormData.comment,
          author: userStore.userInfo,
        };
        const result = await submitCourseReview(payload);
        if (result.code === successCode) {
          ElMessage.success('评价提交成功！');
          emit('reviewSubmitted');
          formEl.resetFields();
          reviewFormData.rating = 0;
        } else {
          ElMessage.error(result.msg || '评价提交失败，请稍后再试。');
        }
      } catch (error) {
        console.error('提交课程评价失败:', error);
        ElMessage.error('网络错误或评价提交失败，请稍后再试。');
      } finally {
        isLoading.value = false;
      }
    } else {
      console.log('表单校验失败!');
    }
  });
};

const handleCancel = () => {
  reviewFormRef.value?.resetFields();
  reviewFormData.rating = 0;
  emit('cancel');
}
</script>

<template>
  <div class="course-review-form-wrapper"> 
    <el-card class="review-card" shadow="hover"> 
      <template #header>
        <div class="review-card-header"> 
          <span>课程评价</span>
        </div>
      </template>
      <el-form
        ref="reviewFormRef"
        :model="reviewFormData"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmitReview(reviewFormRef)"
      >
        <el-form-item label="课程评分" prop="rating">
          <el-rate
            v-model="reviewFormData.rating"
            :max="5"
            show-score
            text-color="#FF9900" 
            score-template="{value} 星"
            size="large"
            allow-half
            class="form-rate-item" 
          />
        </el-form-item>

        <el-form-item label="课程评论" prop="comment">
          <el-input
            v-model="reviewFormData.comment"
            type="textarea"
            :rows="5" 
            placeholder="请输入您对这门课程的看法、建议等..."
            maxlength="500"
            show-word-limit
            clearable
            class="form-textarea-item"
          />
        </el-form-item>

        <el-form-item class="form-actions"> 
          <el-button
            type="primary"
            native-type="submit"
            :loading="isLoading"
            class="action-button" 
            round 
          >
            提交评价
          </el-button>
          <el-button
            @click="handleCancel"
            class="action-button"
            round
            plain 
          >
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.course-review-form-wrapper {
  /* 这个外部容器可以用来设置在父组件中的间距等 */
  /* 例如，如果它直接嵌入在 HomePage 的 Drawer 中，可能不需要这里的 margin */
  /* max-width: 600px; /* 保持与 profile-card 一致的最大宽度 */
  /* margin: 20px auto; /* 如果是独立页面或弹窗中的主要内容 */
  padding: 10px 0; /* 在Drawer内部，可能只需要上下间距 */
}

.review-card {
  width: 100%;
  border-radius: 12px; /* 参考 .profile-card */
  border: 1px solid #ebeef5; /* 添加一个细边框，使其更清晰 */
}

.review-card-header {
  font-size: 18px; /* 参考 .card-header，略小一点作为组件标题 */
  font-weight: bold;
  text-align: center;
  color: #303133;
}

/* 表单元素标签统一样式 */
:deep(.el-form-item__label) {
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px !important; /* 调整标签和输入框的间距 */
  line-height: normal; /* 确保标签行高正常 */
}

.form-rate-item {
  /* ElRate组件可能需要调整垂直对齐 */
  height: auto;
  line-height: normal;
  /* display: inline-flex; // el-rate 已经是 inline-flex */
  /* vertical-align: middle; // 默认通常是 middle */
  /* 如果评分星星和文字未对齐，可以尝试： */
  /* display: flex; */
  /* align-items: center; */
}

:deep(.el-rate__icon),
:deep(.el-rate__text) {
  vertical-align: middle; /* 尝试确保星星和分数文本对齐 */
}


.form-textarea-item :deep(.el-textarea__inner) {
  border-radius: 8px; /* 文本域圆角 */
  padding: 10px 12px; /* 调整内边距 */
  font-size: 14px;
  line-height: 1.6;
}

.form-actions {
  margin-top: 25px; /* 增加与上方表单项的间距 */
  display: flex;
  gap: 15px; /* 按钮间距 */
  /* 默认情况下按钮会根据内容宽度排列，如果想让他们等宽或特定排列，可以进一步调整 */
}

.form-actions .action-button {
  flex-grow: 1; /* 让按钮平分空间，如果需要 */
  padding-top: 10px; /* 按钮内边距 */
  padding-bottom: 10px;
  font-size: 15px;
}

/* 可以为特定按钮添加更具体的样式 */
.form-actions .el-button--primary {
  /* background-color: #409EFF; */ /* Element Plus 默认 */
}

.form-actions .el-button--default { /* 取消按钮的 plain 样式 */
  /* border-color: #DCDFE6; */
}

/* 响应式调整 (如果评价表单可能在不同宽度下显示) */
@media (max-width: 480px) {
  .form-actions {
    flex-direction: column; /* 小屏幕上按钮垂直排列 */
  }
  .form-actions .action-button {
    width: 100%; /* 垂直排列时按钮宽度占满 */
  }
}

</style>