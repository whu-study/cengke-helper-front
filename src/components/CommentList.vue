<template>
  <div class="comment-list-container">
    <div class="add-comment-form" v-if="allowNewComments">
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
          @click="submitNewComment"
          :loading="isSubmittingNewComment"
          round
          class="submit-comment-button"
          :disabled="!newCommentContent.trim()"
      >
        发表评论
      </el-button>
    </div>

    <div v-if="isLoadingComments" class="comments-loading">
      <el-skeleton :rows="3" animated style="margin-bottom: 2vw;" />
      <el-skeleton :rows="2" animated />
    </div>
    <el-alert
        v-else-if="commentsError"
        :title="commentsError"
        type="error"
        show-icon
        :closable="false"
        class="comments-error-alert"
    />
    <el-empty
        v-else-if="comments.length === 0 && !isLoadingComments"
        description="还没有评论，快来抢沙发吧！"
        image-size="80"
        class="no-comments-empty"
    />
    <div v-else class="comments-wrapper">
      <CommentItem
          v-for="comment in comments"
          :key="comment.id" :comment="comment"
          :current-user-id="currentUserId"
          :allow-reply="true"
          :allow-nested-replies="true"
          @reply-submitted="handleReplySubmitted"
          @comment-deleted="handleCommentDeleted"
      />
    </div>
    <div v-if="hasMoreComments && !isLoadingComments && !isLoadingMore" class="load-more-comments">
      <el-button @click="loadMore" :loading="isLoadingMore" round plain>加载更多评论</el-button>
    </div>
    <div v-if="isLoadingMore" class="comments-loading" style="padding: 2vw 0;">
      <el-skeleton :rows="2" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch , nextTick } from 'vue';
import type { PropType } from 'vue';
import CommentItem from './CommentItem.vue';
import type { Comment } from '@/types/discuss';
import type {UserProfile as User} from "@/types/user.ts";
import { ElMessage, ElSkeleton, ElAlert, ElEmpty, ElInput } from 'element-plus';

const props = defineProps({
  postId: {
    type: [String, Number] as PropType<string | number>,
    required: true,
  },
  currentUserId: {
    type: [String, Number] as PropType<string | number | null>,
    default: null,
  },
  allowNewComments: {
    type: Boolean,
    default: true,
  }
});

const emit = defineEmits<{
  (e: 'comment-action-complete'): void; // 通用事件，通知父组件评论区有变动，可以刷新帖子总评论数等
}>();

const comments = ref<Comment[]>([]);
const isLoadingComments = ref(true);
const commentsError = ref<string | null>(null);
const newCommentContent = ref('');
const isSubmittingNewComment = ref(false);
const newCommentInputRef = ref<InstanceType<typeof ElInput> | null>(null);

// --- 分页加载更多评论的状态 ---
const currentPage = ref(1);
const commentsPerPage = ref(5); // 假设每页加载5条顶级评论
const totalCommentsCount = ref(0); // 从后端获取的总评论数（顶级评论）
const isLoadingMore = ref(false);

const hasMoreComments = computed(() => {
  return comments.value.length < totalCommentsCount.value;
});


const mockCurrentUser: User | null = props.currentUserId
    ? { id: props.currentUserId, username: `用户${props.currentUserId}`, avatar: `https://placehold.co/40x40/aabbcc/ffffff?text=${(props.currentUserId || 'U').toString().charAt(0)}` }
    : null;

const fetchComments = async (loadMore = false) => {
  if (!props.postId) return;
  if (!loadMore) {
    isLoadingComments.value = true;
    comments.value = []; // 重置评论列表
    currentPage.value = 1; // 重置页码
  } else {
    isLoadingMore.value = true;
  }
  commentsError.value = null;
  console.log(`获取帖子 ID ${props.postId} 的评论列表, 第 ${currentPage.value} 页...`);

  await new Promise(resolve => setTimeout(resolve, 700)); // 模拟API延迟

  // --- 实际应用中，这里调用 commentService ---
  // try {
  //   const response = await commentService.getCommentsByPostId(props.postId, { page: currentPage.value, limit: commentsPerPage.value });
  //   if (loadMore) {
  //     comments.value.push(...response.data.items); // 追加数据
  //   } else {
  //     comments.value = response.data.items; // 替换数据
  //   }
  //   totalCommentsCount.value = response.data.total; // 更新总评论数
  //   currentPage.value++; // 准备加载下一页
  // } catch (err) {
  //   console.error("获取评论失败:", err);
  //   commentsError.value = "无法加载评论，请稍后再试。";
  // } finally {
  //   isLoadingComments.value = false;
  //   isLoadingMore.value = false;
  // }

  // --- 以下为模拟数据 ---
  const sampleUser1: User = { id: 'user101', username: '评论家王五', avatar: 'https://placehold.co/40x40/7F9CF5/EBF4FF?text=W&font=Montserrat' };
  const sampleUser2: User = { id: 'user102', username: '热心网友赵六', avatar: 'https://placehold.co/40x40/FF69B4/FFF0F5?text=Z&font=Montserrat' };
  const sampleUser3: User = mockCurrentUser || { id: 'user-unknown', username: '匿名用户' };

  const createMockReply = (id: string, parentId: string | number, author: User, content: string, replyTo: User, offsetMinutes: number): Comment => ({
    id, postId: props.postId, parentId, author, content, createdAt: new Date(Date.now() - 1000 * 60 * offsetMinutes), likesCount: Math.floor(Math.random() * 10), replyToUser: replyTo, children: []
  });

  const allMockComments: Comment[] = [
    {
      id: 'comment1', postId: props.postId, author: sampleUser1, content: '写得太棒了！Vue 3 的 Composition API 确实让代码组织清晰了很多。这是第一页的第一条。', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), likesCount: 25,
      children: [
        createMockReply('reply1-1', 'comment1', sampleUser2, '完全同意！特别是 script setup 语法糖。', sampleUser1, 175),
        createMockReply('reply1-2', 'comment1', sampleUser3, '我也觉得，逻辑复用也方便多了。', sampleUser2, 170),
      ],
    },
    { id: 'comment2', postId: props.postId, author: sampleUser2, content: '感谢分享，Element Plus 主题定制这块之前一直没太搞明白，学习了！', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5), likesCount: 18, children: [] },
    { id: 'comment3', postId: props.postId, author: sampleUser1, content: '对于大型项目来说，Composition API 的优势更加明显。', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), likesCount: 30, children: [] },
    { id: 'comment4', postId: props.postId, author: sampleUser3, content: '正在学习中，这篇文章很有帮助！', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5), likesCount: 5, children: [] },
    { id: 'comment5', postId: props.postId, author: sampleUser2, content: '期待更多关于 Vue 3 的深入探讨。', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), likesCount: 12, children: [] },
    // 更多顶级评论用于分页
    { id: 'comment6', postId: props.postId, author: sampleUser1, content: '这是第二页的评论了，测试加载更多。', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25), likesCount: 3, children: [] },
    { id: 'comment7', postId: props.postId, author: sampleUser2, content: '加载更多的第二条。', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26), likesCount: 7, children: [] },
    { id: 'comment8', postId: props.postId, author: sampleUser3, content: '还有吗？继续加载。', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 27), likesCount: 1, children: [] },
    { id: 'comment9', postId: props.postId, author: sampleUser1, content: '差不多最后了。', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28), likesCount: 0, children: [] },
    { id: 'comment10', postId: props.postId, author: sampleUser2, content: '最后一条模拟评论。', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 29), likesCount: 2, children: [] },
  ];

  totalCommentsCount.value = allMockComments.length; // 模拟总数
  const startIndex = (currentPage.value - 1) * commentsPerPage.value;
  const endIndex = startIndex + commentsPerPage.value;
  const newComments = allMockComments.slice(startIndex, endIndex);

  if (loadMore) {
    comments.value.push(...newComments);
  } else {
    comments.value = newComments;
  }

  if (newComments.length > 0) {
    currentPage.value++; // 只有成功加载到数据才增加页码
  }

  isLoadingComments.value = false;
  isLoadingMore.value = false;
};

const loadMore = () => {
  if (hasMoreComments.value) {
    fetchComments(true);
  }
};

const submitNewComment = async () => {
  if (!newCommentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空！');
    return;
  }
  if (!mockCurrentUser) {
    ElMessage.error('请先登录后再发表评论。');
    return;
  }
  isSubmittingNewComment.value = true;
  await new Promise(resolve => setTimeout(resolve, 800));
  try {
    const newCommentData: Omit<Comment, 'id' | 'createdAt' | 'author'> & { authorId: string|number } = { // 模拟提交给后端的数据结构
      postId: props.postId,
      content: newCommentContent.value,
      authorId: mockCurrentUser.id, // 实际应由后端确定
      // parentId: null, // 对于顶级评论
    };
    console.log("Submitting new comment:", newCommentData);
    // const createdComment = await commentService.createComment(newCommentData); // 实际API调用
    // 模拟后端返回的新评论
    const createdComment: Comment = {
      id: `new-${Date.now()}`,
      postId: props.postId,
      author: mockCurrentUser,
      content: newCommentContent.value,
      createdAt: new Date(),
      likesCount: 0,
      children: [],
    };
    // comments.value.unshift(createdComment); // 乐观更新UI
    newCommentContent.value = '';
    ElMessage.success('评论发表成功！');
    await fetchComments(); // 重新获取评论列表以包含新评论和正确排序
    emit('comment-action-complete');
    nextTick(() => newCommentInputRef.value?.blur()); // 发表后失焦
  } catch (error) {
    console.error("发表评论失败:", error);
    ElMessage.error('评论发表失败，请稍后再试。');
  } finally {
    isSubmittingNewComment.value = false;
  }
};

const handleReplySubmitted = async (payload: { parentId: string | number; content: string; replyToUserId?: string | number }) => {
  console.log('CommentList received reply to submit:', payload);
  if (!mockCurrentUser) {
    ElMessage.error('请先登录后再回复。');
    return;
  }
  // isSubmittingNewComment.value = true; // 可以复用或为回复创建单独的加载状态
  await new Promise(resolve => setTimeout(resolve, 600)); // 模拟API延迟
  try {
    const replyData = {
      postId: props.postId,
      parentId: payload.parentId,
      content: payload.content,
      replyToUserId: payload.replyToUserId,
      authorId: mockCurrentUser.id // 实际应由后端确定
    };
    console.log("Submitting reply:", replyData);
    // const createdReply = await commentService.createReply(replyData); // 实际API调用
    ElMessage.success('回复成功！');
    await fetchComments(); // 重新获取评论列表以包含新回复
    emit('comment-action-complete');
  } catch (error) {
    console.error("提交回复失败:", error);
    ElMessage.error('回复提交失败，请稍后再试。');
  } finally {
    // isSubmittingNewComment.value = false;
  }
};

const handleCommentDeleted = async (commentId: string | number) => {
  console.log('CommentList received comment to delete:', commentId);
  try {
    // await commentService.deleteComment(commentId); // 实际API调用
    ElMessage.success('评论已删除！');
    await fetchComments(); // 重新获取评论列表
    emit('comment-action-complete');
  } catch (error) {
    console.error("删除评论失败:", error);
    ElMessage.error('删除评论失败，请稍后再试。');
  }
};

onMounted(() => {
  fetchComments();
});

watch(() => props.postId, (newPostId, oldPostId) => {
  if (newPostId && newPostId !== oldPostId) {
    fetchComments(); // PostId 变化时，重新获取第一页评论
  }
});
</script>

<style scoped>
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
  min-height: 15vw; /* 确保有足够的高度 */
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
