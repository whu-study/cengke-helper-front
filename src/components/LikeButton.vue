<template>
  <el-button
    :type="isLikedState ? 'danger' : 'default'"
    :plain="!isLikedState"
    :icon="isLikedState ? StarFilled : Star"
    @click="handleToggleLike"
    :loading="isLoading"
    :size="size"
    round
    class="like-button"
    aria-live="polite"
    :aria-pressed="isLikedState"
    :aria-label="isLikedState ? '取消点赞' : '点赞'"
  >
    <span v-if="showText" class="like-text">{{ isLikedState ? '已赞' : '点赞' }}</span>
    <span class="like-count">{{ currentLikes }}</span>
  </el-button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';
import { Star, StarFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { usePostsStore } from '@/store/modules/postsStore'; // 导入 postsStore
import { useCommentsStore } from '@/store/modules/commentsStore'; // 导入 commentsStore
import type { ToggleLikeResponseData } from '@/api/postService'; // 或 commentService
// 假设 ToggleLikeResponseData 结构在 postService 和 commentService 中对于点赞是类似的

const props = defineProps({
  itemId: {
    type: [String, Number] as PropType<string | number>,
    required: true,
  },
  initialLikes: {
    type: Number,
    default: 0,
  },
  isInitiallyLiked: {
    type: Boolean,
    default: false,
  },
  itemType: {
    type: String as PropType<'post' | 'comment'>,
    required: true,
    validator: (value: string) => ['post', 'comment'].includes(value),
  },
  size: {
    type: String as PropType<'large' | 'default' | 'small'>,
    default: 'default',
  },
  showText: {
    type: Boolean,
    default: false,
  },
   // 新增一个 prop，用于评论点赞时传递 postId，以便 store 更新
  postIdForComment: {
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  }
});

const emit = defineEmits<{
  (e: 'like-toggled', payload: { itemId: string | number; itemType: 'post' | 'comment'; isLiked: boolean; newLikesCount: number }): void;
}>();

const postsStore = usePostsStore();
const commentsStore = useCommentsStore();

const isLikedState = ref(props.isInitiallyLiked);
const currentLikes = ref(props.initialLikes);
const isLoading = ref(false);

watch(() => props.isInitiallyLiked, (newValue) => {
  isLikedState.value = newValue;
});
watch(() => props.initialLikes, (newValue) => {
  currentLikes.value = newValue;
});

const handleToggleLike =  () => {
  if (isLoading.value) return;
  isLoading.value = true;

  const previousLikedState = isLikedState.value;
  const previousLikesCount = currentLikes.value;

  // 乐观更新 UI (可选，但能提供更好的即时反馈)
  // isLikedState.value = !isLikedState.value;
  // if (isLikedState.value) {
  //   currentLikes.value++;
  // } else {
  //   currentLikes.value--;
  // }

  try {
    if (props.itemType === 'post') {
        postsStore.toggleLikePost(props.itemId).then((responseData) => {
            if (responseData) {
                isLikedState.value = responseData.isLiked;
                currentLikes.value = responseData.likesCount;
                emit('like-toggled', {
                    itemId: props.itemId,
                    itemType: props.itemType,
                    isLiked: isLikedState.value,
                    newLikesCount: currentLikes.value,
                });
            }
        });
    } else if (props.itemType === 'comment') {
        if (props.postIdForComment === undefined) {
            console.error('postIdForComment is required when itemType is "comment"');
            ElMessage.error('操作失败：缺少帖子ID信息');
            throw new Error('Missing postIdForComment for comment like toggle');
        }
        commentsStore.toggleLikeComment(props.itemId, props.postIdForComment).then((responseData) => {
            if (responseData) {
                isLikedState.value = responseData.isLiked;
                currentLikes.value = responseData.likesCount;
                emit('like-toggled', {
                    itemId: props.itemId,
                    itemType: props.itemType,
                    isLiked: isLikedState.value,
                    newLikesCount: currentLikes.value,
                });
            }
        });
    }
} catch (error) {
    console.error('Error toggling like:', error);
    ElMessage.error('操作失败');
}finally {
    isLoading.value = false;
  }
};
</script>
<style scoped>
.like-button {
  /* 基本样式，可以根据需要调整 */
  /* 添加过渡效果，使按钮状态变化更平滑 */
  transition: all 0.2s ease-in-out;
  /* 给按钮一个最小宽度，避免数字变化时按钮大小跳动 */
  min-width: 15vw;
  /* 将按钮内容设置为内联弹性布局 */
  display: inline-flex;
  /* 垂直居中对齐按钮内容 */
  align-items: center;
  /* 水平居中对齐按钮内容 */
  justify-content: center;
  /* 调整内边距以适应移动端 */
  padding: 1.5vw 2.5vw;
  /* 调整字体大小 */
  font-size: 3.5vw;
}

.like-button .el-icon {
  /* 图标大小 */
  font-size: 4vw;
  /* 图标和数字之间的间距 */
  margin-right: 0.8vw;
}

.like-count {
  /* 设置字体加粗 */
  font-weight: 500;
  /* 给数字一个最小宽度，避免跳动 */
  min-width: 3vw;
  /* 文本左对齐 */
  text-align: left;
}

.like-text {
  /* 文本与图标之间的间距 */
  margin-left: 0.8vw;
}

/* 点赞状态下的特定样式 */
.like-button.el-button--danger {
  /* background-color: #f56c6c; */ /* Element Plus danger color */
  /* border-color: #f56c6c; */
  /* color: #fff; */
}
.like-button.el-button--danger.is-plain {
  /* color: #f56c6c; */
  /* background: #fef0f0; */
  /* border-color: #fbc4c4; */
}

/* 针对不同尺寸的微调 */
.like-button.el-button--small {
  /* 小尺寸按钮的最小宽度 */
  min-width: 12vw;
  /* 小尺寸按钮的内边距 */
  padding: 1vw 2vw;
  /* 小尺寸按钮的字体大小 */
  font-size: 3vw;
}
.like-button.el-button--small .el-icon {
  /* 小尺寸按钮的图标大小 */
  font-size: 3.5vw;
}
.like-button.el-button--small .like-count {
  /* 小尺寸按钮点赞数量的最小宽度 */
  min-width: 2.5vw;
}

.like-button.el-button--large {
  /* 大尺寸按钮的最小宽度 */
  min-width: 18vw;
  /* 大尺寸按钮的内边距 */
  padding: 2vw 3vw;
  /* 大尺寸按钮的字体大小 */
  font-size: 4vw;
}
.like-button.el-button--large .el-icon {
  /* 大尺寸按钮的图标大小 */
  font-size: 4.5vw;
}
.like-button.el-button--large .like-count {
  /* 大尺寸按钮点赞数量的最小宽度 */
  min-width: 3.5vw;
}

/* 响应式调整 */
@media (min-width: 768px) {
  .like-button {
    /* 在较大屏幕上使用固定像素值或更小的vw值 */
    min-width: 80px;
    /* 较大屏幕上的内边距 */
    padding: 8px 15px;
    /* 较大屏幕上的字体大小 */
    font-size: 14px;
  }
  .like-button .el-icon {
    /* 较大屏幕上的图标大小 */
    font-size: 16px;
    /* 较大屏幕上图标和数字之间的间距 */
    margin-right: 5px;
  }
  .like-count {
    /* 较大屏幕上点赞数量的最小宽度 */
    min-width: 15px;
  }

  .like-button.el-button--small {
    /* 较大屏幕上小尺寸按钮的最小宽度 */
    min-width: 70px;
    /* 较大屏幕上小尺寸按钮的内边距 */
    padding: 5px 10px;
    /* 较大屏幕上小尺寸按钮的字体大小 */
    font-size: 12px;
  }
  .like-button.el-button--small .el-icon {
    /* 较大屏幕上小尺寸按钮的图标大小 */
    font-size: 14px;
  }

  .like-button.el-button--large {
    /* 较大屏幕上大尺寸按钮的最小宽度 */
    min-width: 90px;
    /* 较大屏幕上大尺寸按钮的内边距 */
    padding: 10px 20px;
    /* 较大屏幕上大尺寸按钮的字体大小 */
    font-size: 16px;
  }
  .like-button.el-button--large .el-icon {
    /* 较大屏幕上大尺寸按钮的图标大小 */
    font-size: 18px;
  }
}
</style>