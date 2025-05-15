<template>
  <!-- 评论项容器，根据是否为回复添加不同样式类 -->
  <div class="comment-item" :class="{ 'is-reply': isReply }">
    <!-- 用户头像 -->
    <el-avatar :size="isReply ? 28 : 36" :src="comment.author.avatar" class="comment-avatar">
      <!-- 如果头像不存在，显示用户名的首字母 -->
      {{ comment.author.username.charAt(0).toUpperCase() }}
    </el-avatar>

    <!-- 评论主体内容 -->
    <div class="comment-main">
      <!-- 评论头部信息（用户名+发布时间） -->
      <div class="comment-header">
        <span class="comment-author-name">{{ comment.author.username }}</span>
        <span class="comment-publish-time">{{ formattedCommentTime }}</span>
      </div>

      <!-- 评论内容区域 -->
      <div class="comment-content">
        <!-- 如果是回复别人的评论，显示"回复 @用户名" -->
        <span v-if="comment.replyToUser && isReply" class="reply-to-user">
          回复 @{{ comment.replyToUser.username }}:&nbsp;
        </span>
        <!-- 评论正文内容 -->
        <el-text tag="span" class="comment-text">{{ comment.content }}</el-text>
      </div>

      <!-- 评论操作按钮区域 -->
      <div class="comment-actions">
        <!-- 点赞按钮 -->
        <LikeButton
            v-if="showLikeButton"
            :item-id="comment.id"
            :initial-likes="comment.likesCount || 0"
            :is-initially-liked="currentUserLikedComment"
            item-type="comment"
            size="small"
            class="action-button"
        />
        <!-- 回复按钮 -->
        <el-button
            v-if="allowReply && !isReply"
            type="info"
            text
            size="small"
            @click="toggleReplyForm"
            class="action-button reply-button"
            :icon="ChatLineSquare"
        >
          {{ showReplyInput ? '取消回复' : '回复' }}
        </el-button>
        <!-- 删除按钮（仅评论作者可见） -->
        <el-button
            v-if="isCommentAuthor"
            type="danger"
            text
            size="small"
            @click="confirmDeleteComment"
            class="action-button delete-button"
            :icon="Delete"
        >
          删除
        </el-button>
      </div>

      <!-- 回复表单（点击回复按钮后显示） -->
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
        <!-- 提交回复按钮 -->
        <el-button type="primary" size="small" @click="submitReply" :loading="isSubmittingReply" round class="submit-reply-button">
          提交回复
        </el-button>
      </div>

      <!-- 嵌套回复列表（子评论） -->
      <div v-if="comment.children && comment.children.length > 0 && showReplies" class="nested-comments">
        <!-- 递归渲染子评论 -->
        <CommentItem
            v-for="reply in comment.children"
            :key="reply.id"
            :comment="reply"
            :is-reply="true"
            :allow-reply="allowNestedReplies"
            :current-user-id="currentUserId"
            :show-like-button="showLikeButton"
            @reply-submitted="(payload) => $emit('reply-submitted', payload)"
            @comment-deleted="(commentId) => $emit('comment-deleted', commentId)"
        />
      </div>
    </div>

    <!-- 删除评论确认对话框 -->
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
          <el-button type="danger" @click="handleDeleteComment" round :loading="isDeletingComment">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 从 Vue 引入所需的 API
import { ref, computed,  nextTick } from 'vue';

import type { PropType } from 'vue';
// 引入 Comment 和 User 类型定义
import type { Comment } from '@/types/discuss';
import  type { UserProfile as User } from "@/types/user";
// 引入 Element Plus 图标和消息提示
import { ChatLineSquare, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElInput } from 'element-plus';
// 引入子组件
import LikeButton from './LikeButton.vue';

// --- Props 定义 ---
const props = defineProps({
  /**
   * 评论数据对象
   * @type {Comment}
   * @required
   */
  comment: {
    type: Object as PropType<Comment>,
    required: true,
  },
  /**
   * 是否为回复型评论 (用于调整样式)
   * @type {boolean}
   * @default false
   */
  isReply: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否允许回复此评论
   * @type {boolean}
   * @default true
   */
  allowReply: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否允许对嵌套的回复进行再回复
   * @type {boolean}
   * @default false
   */
  allowNestedReplies: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否显示点赞按钮
   * @type {boolean}
   * @default true
   */
  showLikeButton: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否默认显示嵌套的回复
   * @type {boolean}
   * @default true
   */
  showReplies: {
    type: Boolean,
    default: true,
  },
  /**
   * 当前登录用户的ID (用于判断是否为评论作者)
   * @type {string|number|null}
   * @default null
   */
  currentUserId: {
    type: [String, Number] as PropType<string | number | null>,
    default: null,
  }
});

// --- Emits 定义 ---
const emit = defineEmits<{
  /**
   * 回复提交事件
   * @param payload - 包含父评论ID和回复内容的对象
   */
  (e: 'reply-submitted', payload: { parentId: string | number; content: string; replyToUserId?: string | number }): void;
  /**
   * 评论删除事件
   * @param commentId - 被删除的评论ID
   */
  (e: 'comment-deleted', commentId: string | number): void;
}>();

// --- 响应式状态 ---
const showReplyInput = ref(false); // 控制回复输入框的显示/隐藏
const replyContent = ref('');     // 回复输入框的内容
const isSubmittingReply = ref(false); // 是否正在提交回复
const deleteDialogVisible = ref(false); // 是否显示删除确认对话框
const isDeletingComment = ref(false); // 是否正在删除评论
const replyInputRef = ref<InstanceType<typeof ElInput> | null>(null); // 回复输入框的引用

// --- 计算属性 ---

/**
 * 格式化评论的发布时间为相对时间（如"2分钟前"）
 * @returns {string} 格式化后的时间字符串
 */
const formattedCommentTime = computed(() => {
  if (!props.comment.createdAt) return '未知时间';
  const date = new Date(props.comment.createdAt);
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

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

/**
 * 模拟当前用户是否已点赞此评论
 * @returns {boolean} 是否已点赞
 */
const currentUserLikedComment = computed(() => {
  return (props.comment.likesCount || 0) % 2 === 1 && props.comment.likesCount !== 0;
});

/**
 * 判断当前登录用户是否是此评论的作者
 * @returns {boolean} 是否是作者
 */
const isCommentAuthor = computed(() => {
  if (!props.currentUserId || !props.comment.author) return false;
  return props.comment.author.id === props.currentUserId;
});

// --- 方法 ---

/**
 * 切换回复输入框的显示状态
 */
const toggleReplyForm = () => {
  showReplyInput.value = !showReplyInput.value;
  if (showReplyInput.value) {
    replyContent.value = '';
    nextTick(() => {
      replyInputRef.value?.focus();
    });
  }
};

/**
 * 提交回复
 */
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空哦！');
    return;
  }

  isSubmittingReply.value = true;
  await new Promise(resolve => setTimeout(resolve, 600));

  emit('reply-submitted', {
    parentId: props.comment.id,
    content: replyContent.value,
    replyToUserId: props.comment.author.id
  });

  ElMessage.success('回复成功！(模拟)');
  replyContent.value = '';
  showReplyInput.value = false;
  isSubmittingReply.value = false;
};

/**
 * 显示删除评论确认对话框
 */
const confirmDeleteComment = () => {
  deleteDialogVisible.value = true;
};

/**
 * 处理删除评论
 */
const handleDeleteComment = async () => {
  isDeletingComment.value = true;
  await new Promise(resolve => setTimeout(resolve, 600));

  emit('comment-deleted', props.comment.id);
  ElMessage.success('评论已删除 (模拟)');
  deleteDialogVisible.value = false;
  isDeletingComment.value = false;
};
</script>

<style scoped>
/* 评论项整体容器 */
.comment-item {
  display: flex; /* 使用 Flexbox 布局 */
  padding: 1.8vw 0; /* 上下内边距 */
  border-top: 1px solid #f0f2f5; /* 评论之间的分隔线 */
  position: relative; /* 用于可能的绝对定位子元素 */
}
/* 第一个评论项不需要顶部边框 */
.comment-item:first-child {
  border-top: none;
}

/* 回复型评论的特定样式 */
.comment-item.is-reply {
  padding-left: 5vw; /* 回复评论向左缩进 */
  padding-top: 1.5vw;
  padding-bottom: 1.5vw;
  border-top: 1px dashed #e8e8e8; /* 回复之间的分隔线样式稍作区分 */
}
.comment-item.is-reply .comment-avatar {
  margin-top: 0.3vw; /* 微调回复头像的垂直对齐 */
}

/* 评论者头像 */
.comment-avatar {
  margin-right: 2.5vw; /* 头像与主内容区域的间距 */
  flex-shrink: 0; /* 防止头像在空间不足时被压缩 */
}

/* 评论主内容区域 */
.comment-main {
  flex-grow: 1; /* 主内容区占据所有剩余空间 */
  display: flex;
  flex-direction: column; /* 子元素垂直排列 */
}

/* 评论头部 (作者名和时间) */
.comment-header {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  margin-bottom: 1vw; /* 与评论内容的间距 */
}

/* 评论作者名 */
.comment-author-name {
  font-size: 3.6vw; /* 作者名字号 */
  font-weight: 600; /* 字体加粗 */
  color: #2c3e50; /* 深色字体 */
  margin-right: 2vw; /* 与发布时间的间距 */
  cursor: pointer; /* 暗示可点击，例如跳转到用户主页 */
}
.comment-author-name:hover {
  color: #409EFF; /* Element Plus 主题色 */
}

/* 评论发布时间 */
.comment-publish-time {
  font-size: 3.1vw; /* 发布时间字号 */
  color: #888; /* 较浅的颜色 */
}

/* 评论内容区域 */
.comment-content {
  font-size: 3.8vw; /* 评论内容字号 */
  line-height: 1.65; /* 行高，提升阅读体验 */
  color: #333; /* 主要内容颜色 */
  word-wrap: break-word; /* 允许长单词或URL换行 */
  margin-bottom: 1.2vw; /* 与操作按钮的间距 */
}

/* 评论文本样式 (el-text 或 p 标签) */
.comment-text {
  margin: 0; /* 移除默认外边距 */
  white-space: pre-wrap; /* 保留文本中的换行和连续空格 */
}

/* "回复 @" 用户名样式 */
.reply-to-user {
  color: #007bff; /* Element Plus 主题色或自定义蓝色 */
  font-weight: 500; /* 稍作强调 */
  /* margin-right: 0.5em; */ /* 通过 &nbsp; 控制间距 */
}

/* 评论操作按钮区域 */
.comment-actions {
  display: flex;
  align-items: center;
  gap: 2vw; /* 操作按钮之间的间距 */
  margin-top: 1.2vw; /* 与评论内容的间距 */
}

/* 通用操作按钮样式 */
.action-button {
  padding: 0.6vw 1.2vw; /* 调整按钮内边距使其更紧凑 */
  font-size: 3.1vw; /* 按钮内文字/图标大小 */
  border-radius: 1vw; /* 轻微圆角 */
}
/* 文本按钮的悬浮/聚焦效果 */
.action-button.el-button.is-text:hover,
.action-button.el-button.is-text:focus {
  background-color: rgba(0, 123, 255, 0.06); /* 轻微的蓝色背景反馈 */
}
/* 回复和删除按钮内图标的样式 */
.reply-button .el-icon,
.delete-button .el-icon {
  font-size: 3.3vw; /* 调整图标大小 */
  margin-right: 0.6vw; /* 图标与文字的间距 */
}

/* 回复表单容器 */
.reply-form-container {
  margin-top: 2.5vw; /* 与操作按钮的间距 */
  padding: 2.5vw; /* 内边距 */
  background-color: #f8f9fa; /* 轻微的背景色以区分 */
  border-radius: 1.8vw; /* 圆角 */
  border: 1px solid #e9ecef; /* 轻微边框 */
}

/* 回复输入框 */
.reply-input {
  margin-bottom: 2vw; /* 与提交按钮的间距 */
}
.reply-input :deep(.el-textarea__inner) {
  font-size: 3.6vw; /* 输入框内文字大小 */
  border-radius: 1.2vw; /* 输入框圆角 */
  padding: 1.5vw 2vw; /* 输入框内边距 */
}

/* 提交回复按钮 */
.submit-reply-button {
  font-size: 3.3vw; /* 按钮文字大小 */
  padding: 1.8vw 3.5vw; /* 按钮内边距 */
}

/* 嵌套回复（子评论）区域 */
.nested-comments {
  margin-top: 2vw; /* 与父评论操作区域的间距 */
}

/* 删除评论确认对话框 */
.delete-comment-dialog .dialog-footer {
  display: flex;
  justify-content: space-around; /* 按钮均匀分布 */
}
.delete-comment-dialog .el-button {
  width: 32vw; /* 按钮宽度 */
  font-size: 3.8vw; /* 按钮内文字大小 */
  padding: 2.8vw 0; /* 按钮垂直内边距 */
  height: auto; /* 高度自适应 */
}

/* 针对平板等稍大屏幕的响应式调整 */
@media (min-width: 768px) {
  .comment-item.is-reply {
    padding-left: 3.5vw; /* 调整回复缩进 */
  }
  .comment-avatar {
    margin-right: 1.2vw; /* 调整头像间距 */
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
    width: 12vw; /* 调整对话框按钮宽度 */
    font-size: 1.2vw;
  }
}
</style>
