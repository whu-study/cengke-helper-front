<template>
  <div class="comment-list-container">
    <div class="add-comment-form" v-if="allowNewComments && userStore.userInfo.id">
      <el-input
          v-model="newCommentContent"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
          maxlength="500"
          show-word-limit
          class="new-comment-input"
          ref="newCommentInputRef"
      />
      <el-button
          type="primary"
          @click="submitNewTopLevelComment"
          :loading="isSubmittingNewComment"
          round
          class="submit-comment-button"
          :disabled="!newCommentContent.trim()"
      >
        发表评论
      </el-button>
    </div>
    <el-alert
        v-else-if="allowNewComments && !userStore.userInfo.id"
        title="请先登录后再发表评论。"
        type="info"
        show-icon
        :closable="false"
        class="comments-error-alert"
    />

    <div v-if="isLoadingInitial" class="comments-loading">
      <el-skeleton :rows="3" animated style="margin-bottom: 2vw;" />
      <el-skeleton :rows="2" animated />
    </div>
    <el-alert
        v-else-if="currentError"
        :title="currentError"
        type="error"
        show-icon
        :closable="false"
        class="comments-error-alert"
    />
    <el-empty
        v-else-if="commentsToDisplay.length === 0 && !isLoadingInitial"
        description="还没有评论，快来抢沙发吧！"
        :image-size="80"
        class="no-comments-empty"
    />
    <div v-else class="comments-wrapper">
      <CommentItem
          v-for="comment in commentsToDisplay"
          :key="comment.id"
          :comment="comment"
          :current-user-id="userStore.userInfo.id"
          :allow-reply="true" 
          :allow-nested-replies="true" 
          :post-id="props.postId" @comment-operation-complete="handleCommentOperation"
      />
    </div>
    <div v-if="currentPagination && currentPagination.hasMore && !isLoadingInitial && !isLoadingMore" class="load-more-comments">
      <el-button @click="loadMore" :loading="isLoadingMore" round plain>加载更多评论</el-button>
    </div>
    <div v-if="isLoadingMore" class="comments-loading" style="padding: 2vw 0;">
      <el-skeleton :rows="2" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import type { PropType } from 'vue';
import CommentItem from '@/components/comment/CommentItem.vue'; // 调整路径
// import type { Comment } from '@/types/discuss'; // Comment 类型由 store 提供
import { useCommentsStore } from '@/store/modules/commentsStore'; // 调整路径
import { useUserStore } from '@/store/modules/userStore'; // 调整路径
import { ElMessage, ElSkeleton, ElAlert, ElEmpty, ElInput, ElButton } from 'element-plus';
import type { AddCommentPayload } from '@/api/commentService'; // 调整路径


const props = defineProps({
  postId: {
    type: [String, Number] as PropType<string | number>,
    required: true,
  },
  allowNewComments: { // 是否允许发表新的顶级评论
    type: Boolean,
    default: true,
  }
  // currentUserId 不再需要从 props 传入，直接从 userStore 获取
});

const emit = defineEmits<{
  (e: 'comment-action-complete'): void; // 可能用于通知更上层（如帖子详情页）评论总数变化等
}>();

const commentsStore = useCommentsStore();
const userStore = useUserStore();

const newCommentContent = ref('');
const isSubmittingNewComment = ref(false);
const newCommentInputRef = ref<InstanceType<typeof ElInput> | null>(null);
const isLoadingMore = ref(false); // 加载更多的loading状态

// 从 store 获取计算属性
const commentsToDisplay = computed(() => commentsStore.getCommentsForPost(props.postId));
// 初始加载状态，仅当不是“加载更多”时显示骨架屏
const isLoadingInitial = computed(() => commentsStore.getIsLoadingForPost(props.postId) && !isLoadingMore.value);
const currentError = computed(() => commentsStore.getErrorForPost(props.postId));
const currentPagination = computed(() => commentsStore.getPaginationForPost(props.postId));

const commentsPerPage = 5; // 或从配置/store获取

const fetchCommentsList = (loadMore = false) => {
  if (!props.postId) return Promise.resolve();

  const params = {
    limit: commentsPerPage,
    // page 参数由 store 内部根据 loadMore 和 paginationByPostId[postId].currentPage 处理
  };

  if (loadMore) {
    isLoadingMore.value = true;
  }
  // isLoadingInitial 会通过 store 的 isLoadingByPostId[props.postId] 自动更新
  
  return commentsStore.fetchComments(props.postId, params, loadMore)
    .catch(err => {
      // 错误信息已在 store 中处理并设置 (currentError)
      console.error("CommentList: Failed to fetch comments:", err);
    })
    .finally(() => {
      if (loadMore) {
        isLoadingMore.value = false;
      }
    });
};

onMounted(() => {
  fetchCommentsList();
});

watch(() => props.postId, (newPostId, oldPostId) => {
  if (newPostId && newPostId !== oldPostId) {
    fetchCommentsList(); // PostId 变化，重新获取第一页评论
  }
});

const submitNewTopLevelComment = async () => {
  if (!newCommentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空！');
    return;
  }
  if (!userStore.userInfo.id) {
    ElMessage.error('请先登录后再发表评论。');
    return;
  }

  isSubmittingNewComment.value = true;
  const payload: Omit<AddCommentPayload, 'authorId'> = {
    postId: props.postId,
    content: newCommentContent.value,
    // parentId 和 replyToUserId 为空，表示是顶级评论
  };

  try {
    const newComment = await commentsStore.addComment(payload);
    if (newComment) {
      newCommentContent.value = '';
      // store.addComment 成功后会刷新列表，这里不需要手动刷新
      emit('comment-action-complete'); // 通知父组件评论区有变动
      nextTick(() => newCommentInputRef.value?.blur());
    }
  } catch (err) {
    // 错误信息已在 store 中处理
    console.error("CommentList: Failed to submit new comment:", err);
  } finally {
    isSubmittingNewComment.value = false;
  }
};

const loadMore = () => {
  if (currentPagination.value && currentPagination.value.hasMore && !isLoadingMore.value) {
    fetchCommentsList(true);
  }
};

// 当 CommentItem 完成操作后触发 (例如，回复或删除成功)
// Store 更新后，列表会自动响应。此函数主要用于 debug 或未来需要更精细控制的场景
const handleCommentOperation = () => {
  console.log("CommentList: A comment operation was completed in a child item.");
  // 通常不需要手动刷新，因为 store 的变化会通过 computed属性 (`commentsToDisplay`) 反映出来
  // emit('comment-action-complete'); // 如果需要通知更上层
};

</script>

<style scoped>
/* */ /* ... 样式保持不变 ... */
.comment-list-container {
  margin-top: 3vw;
}

.add-comment-form {
  margin-bottom: 4vw;
  padding: 3vw;
  background-color: #fdfdfd;
  border: 1px solid #eee;
  border-radius: 2vw;
}

.new-comment-input {
  margin-bottom: 2vw;
}
.new-comment-input :deep(.el-textarea__inner) {
  font-size: 3.8vw;
  border-radius: 1.5vw;
  padding: 2vw 2.5vw;
  min-height: 15vw; 
}

.submit-comment-button {
  width: 100%;
  font-size: 4vw;
  padding: 2.8vw 0;
  height: auto;
}

.comments-loading,
.comments-error-alert,
.no-comments-empty {
  padding: 4vw 0;
}
.comments-error-alert {
  font-size: 3.5vw;
}
.no-comments-empty :deep(.el-empty__description) {
  font-size: 3.8vw;
}
.no-comments-empty :deep(.el-empty__image) {
  width: 25vw !important;
}

.comments-wrapper {
  /* 评论列表的容器样式 */
}
.load-more-comments {
  text-align: center;
  margin-top: 3vw;
}
.load-more-comments .el-button {
  font-size: 3.5vw;
  padding: 2vw 4vw;
}


@media (min-width: 768px) {
  .add-comment-form {
    padding: 2vw;
    border-radius: 1vw;
  }
  .new-comment-input :deep(.el-textarea__inner) {
    font-size: 1.4vw;
    min-height: 80px;
  }
  .submit-comment-button {
    font-size: 1.3vw;
    padding: 1vw 0;
  }
  .no-comments-empty :deep(.el-empty__description) {
    font-size: 1.3vw;
  }
  .no-comments-empty :deep(.el-empty__image) {
    width: 100px !important;
  }
  .load-more-comments .el-button {
    font-size: 1.2vw;
  }
}
</style>