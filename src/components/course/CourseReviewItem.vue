<template>
    <div class="course-review-item">
      <el-card shadow="hover" class="review-card">
        <template #header>
          <div class="review-header">
            <span class="reviewer-name">{{ review.reviewerName || '匿名用户' }}</span>
            <el-rate
              :model-value="review.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value} 星"
              size="small"
              class="review-rating"
            />
          </div>
        </template>
        <p class="review-comment">{{ review.comment }}</p>
        <div class="review-footer">
          <span class="review-time">
            <el-icon :size="14" style="vertical-align: middle; margin-right: 4px;"><Clock /></el-icon>
            {{ formattedCreatedAt }}
          </span>
          </div>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import {  computed } from 'vue';
  import type { PropType } from 'vue';
  import type { CourseReviewInfo } from '@/types/course'; // 确保路径正确
  import { ElCard, ElRate, ElIcon } from 'element-plus';
  import { Clock } from '@element-plus/icons-vue'; // 导入时钟图标
  
  const props = defineProps({
    review: {
      type: Object as PropType<CourseReviewInfo>,
      required: true,
    },
  });
  
  const formattedCreatedAt = computed(() => {
    if (!props.review.createdAt) return '未知时间';
    try {
      // 尝试将 props.review.createdAt 转换为 Date 对象
      const date = new Date(props.review.createdAt);
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        // 如果无效，直接返回原始字符串或一个提示
        return typeof props.review.createdAt === 'string' ? props.review.createdAt : '无效日期';
      }
      // 返回格式化的本地日期和时间字符串
      return date.toLocaleString();
    } catch (error) {
      // 如果转换出错，也返回原始字符串或一个提示
      console.error('Error formatting date:', error);
      return typeof props.review.createdAt === 'string' ? props.review.createdAt : '日期格式错误';
    }
  });
  </script>
  
  <style scoped lang="scss">
  .course-review-item {
    margin-bottom: 16px;
  }
  
  .review-card {
    border-radius: 8px;
    background-color: #fff; // 单个评价卡片的背景色
  
    :deep(.el-card__header) {
      padding: 10px 15px;
      background-color: #f8f9fa; // 头部背景色
      border-bottom: 1px solid #e9ecef;
    }
  
    :deep(.el-card__body) {
      padding: 15px;
      font-size: 14px;
    }
  }
  
  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .reviewer-name {
    font-weight: 600;
    color: #343a40;
  }
  
  .review-rating {
    // el-rate 默认样式可能已足够，如有需要可调整
    :deep(.el-rate__icon) {
      margin-right: 2px;
    }
     :deep(.el-rate__text) {
      font-size: 13px;
      padding-left: 4px;
    }
  }
  
  .review-comment {
    color: #495057;
    line-height: 1.6;
    margin-top: 0;
    margin-bottom: 12px;
    white-space: pre-wrap; /* 保留换行符和空格 */
  }
  
  .review-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 12px;
    color: #868e96;
  }
  
  .review-time {
    display: inline-flex; /* 使用 flex 使得图标和文字垂直对齐 */
    align-items: center;
  }
  </style>