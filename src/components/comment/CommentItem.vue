// CommentItem.vue
<template>
  <div class="comment-item" :class="{ 'is-reply': isReply }">
    <el-avatar :size="isReply ? 28 : 36" :src="comment.author.avatar" class="comment-avatar">
      {{ comment.author.username.charAt(0).toUpperCase() }}
    </el-avatar>

    <div class="comment-main">
      <div class="comment-header">
        <span class="comment-author-name">{{ comment.author.username }}</span>
        <span class="comment-publish-time">{{ formattedCommentTime }}</span>
      </div>

      <div class="comment-content">
        <span v-if="comment.replyToUser && isReply" class="reply-to-user">
          回复 @{{ comment.replyToUser.username }}:&nbsp;
        </span>
        <el-text tag="span" class="comment-text">{{ comment.content }}</el-text>
      </div>

      <div class="comment-actions">
        <LikeButton
            v-if="showLikeButton"
            :item-id="comment.id"
            :initial-likes="comment.likesCount || 0"
            :is-initially-liked="!!comment.isLikedByCurrentUser"
            item-type="comment"
            size="small"
            class="action-button"
            @like-toggled="handleLikeToggle" 
            :post-id="postIdForLikeButton" />
        <el-button
            v-if="allowReply && !isReply && userStore.userInfo.id"
            type="info"
            text
            size="small"
            @click="toggleReplyForm"
            class="action-button reply-button"
            :icon="ChatLineSquare"
        >
          {{ showReplyInput ? '取消回复' : '回复' }}
        </el-button>
        <el-button
            v-if="isCommentAuthor && userStore.userInfo.id"
            type="danger"
            text
            size="small"
            @click="confirmDeleteComment"
            class="action-button delete-button"
            :icon="Delete"
            :loading="isDeletingComment"
        >
          删除
        </el-button>
      </div>

      <div v-if="showReplyInput && !isReply" class="reply-form-container">
        <el-input
            v-model="replyContent"
            type="textarea"
            :rows="2"
            :placeholder="`回复 @${comment.author.username}`"
            maxlength="200"
            show-word-limit
            class="reply-input"
            ref="replyInputRef"
        />
        <el-button type="primary" size="small" @click="submitReplyHandler" :loading="isSubmittingReply" round class="submit-reply-button">
          提交回复
        </el-button>
      </div>

      <div v-if="comment.children && comment.children.length > 0 && showReplies" class="nested-comments">
        <CommentItem
            v-for="reply_item in comment.children" 
            :key="reply_item.id"
            :comment="reply_item"
            :is-reply="true"
            :allow-reply="allowNestedReplies"
            :current-user-id="currentUserId" 
            :show-like-button="showLikeButton"
            :post-id="postIdForLikeButton" @comment-operation-complete="$emit('comment-operation-complete')" />
      </div>
    </div>

    <el-dialog
        v-model="deleteDialogVisible"
        title="确认删除评论"
        width="80vw"
        :max-width="'350px'"
        center
        append-to-body
        class="delete-comment-dialog"
    >
      <span>确定要删除这条评论吗？此操作不可撤销。</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false" round>取消</el-button>
          <el-button type="danger" @click="handleDeleteCommentConfirmed" round :loading="isDeletingComment">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, toRefs } from 'vue';
import type { PropType } from 'vue';
import type { Comment as CommentType } from '@/types/discuss'; // 重命名以避免冲突
import { useUserStore } from '@/store/modules/userStore'; // 调整路径
import { useCommentsStore } from '@/store/modules/commentsStore'; // 调整路径
import { ChatLineSquare, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElInput, ElDialog, ElButton, ElAvatar, ElText } from 'element-plus';
import LikeButton from '@/components/LikeButton.vue'; // 假设 LikeButton.vue 已修改或能接收 postId
import type { AddCommentPayload, ToggleLikeCommentResponseData } from '@/api/commentService';


const props = defineProps({
  comment: {
    type: Object as PropType<CommentType>,
    required: true,
  },
  isReply: {
    type: Boolean,
    default: false,
  },
  allowReply: {
    type: Boolean,
    default: true,
  },
  allowNestedReplies: { // 用于控制子评论是否能再回复
    type: Boolean,
    default: true, // 通常顶级评论的子评论允许再回复
  },
  showLikeButton: {
    type: Boolean,
    default: true,
  },
  showReplies: {
    type: Boolean,
    default: true,
  },
  currentUserId: { // 来自父组件，或直接从 userStore 获取
    type: [String, Number] as PropType<string | number | null>,
    default: null,
  },
  postId: { // 新增：接收 postId，用于点赞、回复、删除时传给 store
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  }
});

const emit = defineEmits<{
  // 当评论有任何（点赞、回复、删除）操作完成时触发，通知 CommentList 可能需要更新
  (e: 'comment-operation-complete'): void;
}>();

const userStore = useUserStore();
const commentsStore = useCommentsStore();

const { comment: commentRef } = toRefs(props); // 创建对 comment prop 的响应式引用

const showReplyInput = ref(false);
const replyContent = ref('');
const isSubmittingReply = ref(false);
const deleteDialogVisible = ref(false);
const isDeletingComment = ref(false);
const replyInputRef = ref<InstanceType<typeof ElInput> | null>(null);

// 从 comment prop 或 props.postId 获取 postId
// 后端返回的 comment 对象里应该有 postId，如果没有，则依赖父组件传递的 postId prop
const postIdForOperations = computed(() => props.comment.postId || props.postId || props.comment.postId);


// 用于传递给 LikeButton，确保 LikeButton 能拿到 postId
const postIdForLikeButton = computed(() => postIdForOperations.value);


const formattedCommentTime = computed(() => {
  if (!props.comment.createdAt) return '未知时间';
  const date = new Date(props.comment.createdAt);
  // ... (时间格式化逻辑不变)
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds}秒前`;
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
});

const isCommentAuthor = computed(() => {
  const uid = props.currentUserId || userStore.userInfo.id;
  if (!uid || !props.comment.author) return false;
  return props.comment.author.id === uid;
});

const toggleReplyForm = () => {
  showReplyInput.value = !showReplyInput.value;
  if (showReplyInput.value) {
    replyContent.value = ''; // 清空旧内容
    nextTick(() => {
      replyInputRef.value?.focus();
    });
  }
};

const submitReplyHandler = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空哦！');
    return;
  }
  if (!userStore.userInfo.id) {
    ElMessage.error('请先登录再回复。');
    return;
  }
  if (!postIdForOperations.value) {
      ElMessage.error('无法确定帖子ID，回复失败。');
      console.error("Post ID is missing for submitting reply for comment:", props.comment.id);
      return;
  }

  isSubmittingReply.value = true;
  const payload: Omit<AddCommentPayload, 'authorId'> = {
    postId: postIdForOperations.value,
    content: replyContent.value,
    parentId: props.comment.id,
    replyToUserId: props.comment.author.id, // 回复给当前评论的作者
  };

  try {
    const newReply = await commentsStore.addComment(payload);
    if (newReply) {
      // 回复成功后，store 会更新列表，CommentList 会自动响应
      replyContent.value = '';
      showReplyInput.value = false;
      emit('comment-operation-complete'); // 通知列表可能有更新
    }
  } catch (error) {
    // ElMessage 已经在 store 中处理
    console.error('Submit reply failed in CommentItem:', error);
  } finally {
    isSubmittingReply.value = false;
  }
};

const confirmDeleteComment = () => {
  deleteDialogVisible.value = true;
};

const handleDeleteCommentConfirmed = async () => {
  if (!userStore.userInfo.id) {
    ElMessage.error('请先登录再删除。');
    return;
  }
   if (!postIdForOperations.value) {
      ElMessage.error('无法确定帖子ID，删除失败。');
      console.error("Post ID is missing for deleting comment:", props.comment.id);
      deleteDialogVisible.value = false;
      return;
  }

  isDeletingComment.value = true;
  try {
    const success = await commentsStore.deleteComment(props.comment.id, postIdForOperations.value);
    if (success) {
      // 删除成功后，store 会更新列表，CommentList 会自动响应
      emit('comment-operation-complete'); // 通知列表可能有更新
    }
  } catch (error) {
    // ElMessage 已经在 store 中处理
     console.error('Delete comment failed in CommentItem:', error);
  } finally {
    deleteDialogVisible.value = false;
    isDeletingComment.value = false;
  }
};

// LikeButton 的 @like-toggled 事件处理器
// LikeButton 内部已经做了乐观更新和调用 store
// 这个函数主要是为了在 CommentItem 层面如果需要额外处理或通知父组件时使用
const handleLikeToggle = async (eventPayload: { itemId: string | number; itemType: 'post' | 'comment'; isLiked: boolean; newLikesCount: number }) => {
  // eventPayload 包含 itemId (即 comment.id), isLiked, newLikesCount
  // LikeButton 组件已经调用了 commentsStore.toggleLikeComment
  // commentsStore 会更新全局状态，依赖于该状态的 props (如 comment.isLikedByCurrentUser, comment.likesCount) 会自动更新
  console.log(`CommentItem: Like status toggled for comment ${eventPayload.itemId}, new state: ${eventPayload.isLiked}`);
  
  // 如果 LikeButton 没有直接调用 store，或者你想在这里再次确认，可以这样做：
  // try {
  //   if (!postIdForOperations.value) throw new Error("Post ID missing for like operation");
  //   await commentsStore.toggleLikeComment(props.comment.id, postIdForOperations.value);
  //   emit('comment-operation-complete');
  // } catch (error) {
  //   // 错误已在store处理，或者LikeButton内部处理
  //   console.error("Error toggling like from CommentItem:", error);
  // }

  // 假设 LikeButton 已经处理了 store 调用，这里可以只 emit 事件
   emit('comment-operation-complete');
};

</script>

<style scoped>
/* */ /* ... 样式保持不变 ... */
.comment-item {
  display: flex;
  padding: 1.8vw 0; 
  border-top: 1px solid #f0f2f5;
  position: relative; 
}
.comment-item:first-child {
  border-top: none;
}

.comment-item.is-reply {
  padding-left: 5vw; 
  padding-top: 1.5vw;
  padding-bottom: 1.5vw;
  border-top: 1px dashed #e8e8e8;
}
.comment-item.is-reply .comment-avatar {
  margin-top: 0.3vw; 
}

.comment-avatar {
  margin-right: 2.5vw;
  flex-shrink: 0; 
}

.comment-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column; 
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 1vw; 
}

.comment-author-name {
  font-size: 3.6vw;
  font-weight: 600; 
  color: #2c3e50; 
  margin-right: 2vw;
  cursor: pointer; 
}
.comment-author-name:hover {
  color: #409EFF;
}

.comment-publish-time {
  font-size: 3.1vw; 
  color: #888;
}

.comment-content {
  font-size: 3.8vw; 
  line-height: 1.65;
  color: #333; 
  word-wrap: break-word; 
  margin-bottom: 1.2vw;
}

.comment-text {
  margin: 0; 
  white-space: pre-wrap;
}

.reply-to-user {
  color: #007bff; 
  font-weight: 500;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 2vw; 
  margin-top: 1.2vw; 
}

.action-button {
  padding: 0.6vw 1.2vw;
  font-size: 3.1vw; 
  border-radius: 1vw;
}
.action-button.el-button.is-text:hover,
.action-button.el-button.is-text:focus {
  background-color: rgba(0, 123, 255, 0.06);
}
.reply-button .el-icon,
.delete-button .el-icon {
  font-size: 3.3vw; 
  margin-right: 0.6vw;
}

.reply-form-container {
  margin-top: 2.5vw; 
  padding: 2.5vw;
  background-color: #f8f9fa; 
  border-radius: 1.8vw; 
  border: 1px solid #e9ecef;
}

.reply-input {
  margin-bottom: 2vw; 
}
.reply-input :deep(.el-textarea__inner) {
  font-size: 3.6vw;
  border-radius: 1.2vw; 
  padding: 1.5vw 2vw;
}

.submit-reply-button {
  font-size: 3.3vw; 
  padding: 1.8vw 3.5vw;
}

.nested-comments {
  margin-top: 2vw; 
}

.delete-comment-dialog .dialog-footer {
  display: flex;
  justify-content: space-around; 
}
.delete-comment-dialog .el-button {
  width: 32vw; 
  font-size: 3.8vw;
  padding: 2.8vw 0; 
  height: auto;
}

@media (min-width: 768px) {
  .comment-item.is-reply {
    padding-left: 3.5vw;
  }
  .comment-avatar {
    margin-right: 1.2vw;
  }
  .comment-author-name {
    font-size: 1.4vw;
  }
  .comment-publish-time {
    font-size: 1.15vw;
  }
  .comment-content {
    font-size: 1.45vw;
  }
  .action-button,
  .reply-button .el-icon,
  .delete-button .el-icon {
    font-size: 1.15vw;
  }
  .reply-input :deep(.el-textarea__inner) {
    font-size: 1.35vw;
  }
  .submit-reply-button {
    font-size: 1.25vw;
  }
  .delete-comment-dialog .el-button {
    width: 12vw; 
    font-size: 1.2vw;
  }
}
</style>