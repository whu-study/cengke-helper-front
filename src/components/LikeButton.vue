// LikeButton.vue
<template>
  <el-button
      :type="optimisticLikedState ? 'danger' : 'default'"
      :plain="!optimisticLikedState"
      :icon="optimisticLikedState ? StarFilled : Star"
      @click="handleToggleLikeWithStore"
      :loading="isLoading"
      :size="size"
      round
      class="like-button"
      aria-live="polite"
      :aria-pressed="optimisticLikedState"
      :aria-label="optimisticLikedState ? '取消点赞' : '点赞'"
  >
    <span class="like-count">{{ optimisticLikesCount }}</span>
  </el-button>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRefs } from 'vue';
import type { PropType } from 'vue';
import { Star, StarFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useCommentsStore } from '@/store/modules/commentsStore'; // 调整路径
import { useUserStore } from '@/store/modules/userStore'; // 调整路径
import { usePostsStore } from '@/store/modules/postsStore'; // 调整路径

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
  itemType: { // 'post' | 'comment'
    type: String as PropType<'post' | 'comment'>,
    required: true,
    validator: (value: string) => ['post', 'comment'].includes(value),
  },
  size: {
    type: String as PropType<'large' | 'default' | 'small'>,
    default: 'default',
  },
  // 新增 postId, 主要用于评论点赞时，让 store 知道是哪个帖子的评论
  postId: {
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  }
});

const emit = defineEmits<{
  (e: 'like-toggled', payload: { itemId: string | number; itemType: 'post' | 'comment'; isLiked: boolean; newLikesCount: number; success: boolean }): void;
}>();

const commentsStore = useCommentsStore();
const userStore = useUserStore();
const postsStore = usePostsStore();

const isLoading = ref(false);

// 用于乐观更新的本地状态
const optimisticLikedState = ref(props.isInitiallyLiked);
const optimisticLikesCount = ref(props.initialLikes);

// 监听 props 的变化以更新本地乐观状态
watch(() => props.isInitiallyLiked, (newValue) => {
  optimisticLikedState.value = newValue;
});
watch(() => props.initialLikes, (newValue) => {
  optimisticLikesCount.value = newValue;
});


const handleToggleLikeWithStore = async () => {
  if (isLoading.value) return;
  if (!userStore.userInfo.id) {
      ElMessage.error('请先登录后再点赞');
      return;
  }
  // 对于评论点赞，postId 是必需的
  if (props.itemType === 'comment' && !props.postId) {
      ElMessage.error('操作失败：缺少 postId');
      console.error("LikeButton: postId is required for liking a comment.");
      return;
  }

  isLoading.value = true;

  const originalLikedState = optimisticLikedState.value;
  const originalLikesCount = optimisticLikesCount.value;

  // 乐观更新 UI
  optimisticLikedState.value = !optimisticLikedState.value;
  optimisticLikesCount.value += optimisticLikedState.value ? 1 : -1;

  try {
    let success = false;
    if (props.itemType === 'comment') {
      const result = await commentsStore.toggleLikeComment(props.itemId, props.postId!); // 使用 props.postId
      if (result) { // store action 成功
        // store 会更新全局状态，props 会相应变化，然后 watch 会更新 optimisticLikedState 和 optimisticLikesCount
        // 但为了即时反馈API的真实结果，可以手动同步一下（尽管通常watch就够了）
        optimisticLikedState.value = result.isLiked;
        optimisticLikesCount.value = result.likesCount;
        success = true;
      } else { 
        // result 为 null 表示 store 内部可能因为某些原因（如未登录，已在 store 处理）没有执行 API
        // 或者 API 调用失败（已在 store 中 ElMessage 提示）
        // 回滚乐观更新
        optimisticLikedState.value = originalLikedState;
        optimisticLikesCount.value = originalLikesCount;
      }
    } else if (props.itemType === 'post') {
      let success = false;
      if(props.itemType === 'post') {
        const result = await postsStore.toggleLikePost(props.itemId);

      if (result) { // store action 成功
        // store 会更新全局状态，props 会相应变化，然后 watch 会更新 optimisticLikedState 和 optimisticLikesCount
        // 但为了即时反馈API的真实结果，可以手动同步一下（尽管通常watch就够了）
        optimisticLikedState.value = result.isLiked;
        optimisticLikesCount.value = result.likesCount;
        success = true;
      } else { 
        // result 为 null 表示 store 内部可能因为某些原因（如未登录，已在 store 处理）没有执行 API
        // 或者 API 调用失败（已在 store 中 ElMessage 提示）
        // 回滚乐观更新
        optimisticLikedState.value = originalLikedState;
        optimisticLikesCount.value = originalLikesCount;
      }
      }
      // TODO: 实现帖子点赞逻辑，可能需要另一个 store 或方法

    }
    
    emit('like-toggled', {
        itemId: props.itemId,
        itemType: props.itemType,
        isLiked: optimisticLikedState.value, // 使用乐观更新后的状态
        newLikesCount: optimisticLikesCount.value,
        success: success,
    });
    if (success && (optimisticLikedState.value !== originalLikedState)) { // 只有状态真正改变且成功才提示
        // ElMessage.success(optimisticLikedState.value ? '点赞成功' : '已取消点赞'); // store中可能已有提示
    }


  } catch (error) { // store action reject 时
    console.error(`LikeButton: Failed to toggle like for ${props.itemType} ID ${props.itemId}:`, error);
    // 回滚乐观更新
    optimisticLikedState.value = originalLikedState;
    optimisticLikesCount.value = originalLikesCount;
    // ElMessage.error('操作失败，请稍后再试'); // store 中应该已经提示过了
     emit('like-toggled', {
        itemId: props.itemId,
        itemType: props.itemType,
        isLiked: originalLikedState, // 回滚后的状态
        newLikesCount: originalLikesCount,
        success: false,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* */ /* ... 样式保持不变 ... */
.like-button {
  transition: all 0.2s ease-in-out;
  min-width: 15vw;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1.5vw 2.5vw;
  font-size: 3.5vw;
}

.like-button .el-icon {
  font-size: 4vw;
  margin-right: 0.8vw;
}

.like-count {
  font-weight: 500;
  min-width: 3vw;
  text-align: left;
}

.like-text {
  margin-left: 0.8vw;
}

.like-button.el-button--danger {
}
.like-button.el-button--danger.is-plain {
}

.like-button.el-button--small {
  min-width: 12vw;
  padding: 1vw 2vw;
  font-size: 3vw;
}
.like-button.el-button--small .el-icon {
  font-size: 3.5vw;
}
.like-button.el-button--small .like-count {
  min-width: 2.5vw;
}

.like-button.el-button--large {
  min-width: 18vw;
  padding: 2vw 3vw;
  font-size: 4vw;
}
.like-button.el-button--large .el-icon {
  font-size: 4.5vw;
}
.like-button.el-button--large .like-count {
  min-width: 3.5vw;
}

@media (min-width: 768px) {
  .like-button {
    min-width: 80px;
    padding: 8px 15px;
    font-size: 14px;
  }
  .like-button .el-icon {
    font-size: 16px;
    margin-right: 5px;
  }
  .like-count {
    min-width: 15px;
  }

  .like-button.el-button--small {
    min-width: 70px;
    padding: 5px 10px;
    font-size: 12px;
  }
  .like-button.el-button--small .el-icon {
    font-size: 14px;
  }

  .like-button.el-button--large {
    min-width: 90px;
    padding: 10px 20px;
    font-size: 16px;
  }
  .like-button.el-button--large .el-icon {
    font-size: 18px;
  }
}
</style>