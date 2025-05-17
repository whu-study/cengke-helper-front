// src/store/modules/commentsStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Comment } from '@/types/discuss';
import { ElMessage } from 'element-plus';
import {
    apiGetCommentsByPostId,
    apiAddComment,
    apiDeleteComment,
    apiToggleLikeComment,
    type GetCommentsParams,
    type AddCommentPayload,
    type GetCommentsResponseData,
    type ToggleLikeCommentResponseData
} from '@/api/commentService'; // 调整路径
import { useUserStore } from '@/store/modules/userStore'; // 调整路径
import type { TransDef } from '@/api/myAxios'; // 调整路径

export const useCommentsStore = defineStore('comments', () => {
    const commentsByPostId = ref<Record<string | number, Comment[]>>({});
    const isLoadingByPostId = ref<Record<string | number, boolean>>({});
    const errorByPostId = ref<Record<string | number, string | null>>({});
    const paginationByPostId = ref<Record<string | number, { currentPage: number, pageSize: number, totalComments: number, hasMore: boolean }>>({});

    const getCommentsForPost = computed(() => {
        return (postId: string | number) => commentsByPostId.value[postId] || [];
    });
    const getIsLoadingForPost = computed(() => {
        return (postId: string | number) => isLoadingByPostId.value[postId] || false;
    });
    const getErrorForPost = computed(() => {
        return (postId: string | number) => errorByPostId.value[postId] || null;
    });
    const getPaginationForPost = computed(() => {
        return (postId: string | number) => paginationByPostId.value[postId] || { currentPage: 1, pageSize: 5, totalComments: 0, hasMore: true };
    });

    // 辅助函数：递归更新评论列表中的特定评论
    function updateCommentInList(comments: Comment[], targetCommentId: string | number, updateFn: (comment: Comment) => void): boolean {
        for (let i = 0; i < comments.length; i++) {
            if (comments[i].id.toString() === targetCommentId.toString()) {
                updateFn(comments[i]);
                return true;
            }
            if (comments[i].children && comments[i].children!.length > 0) {
                if (updateCommentInList(comments[i].children!, targetCommentId, updateFn)) {
                    return true;
                }
            }
        }
        return false;
    }


    function fetchComments(postId: string | number, params: GetCommentsParams = {}, loadMore = false): Promise<void> {
        isLoadingByPostId.value[postId] = true;
        errorByPostId.value[postId] = null;

        const currentPageToFetch = loadMore ? (paginationByPostId.value[postId]?.currentPage || 1) : 1;
        const defaultPageSize = 5; // 默认每页数量
        const limitToFetch = params.limit || paginationByPostId.value[postId]?.pageSize || defaultPageSize;

        if (!loadMore) {
            // commentsByPostId.value[postId] = []; // 刷新时先清空，或者根据需要保留旧数据直到新数据返回
        }

        return apiGetCommentsByPostId(postId, { ...params, page: currentPageToFetch, limit: limitToFetch })
            .then((response: TransDef<GetCommentsResponseData>) => {
                if (response.code === 0 && response.data) {
                    const fetchedComments = response.data.items.map(c => ({ ...c, postId: postId })); // 附加 tempPostId
                    if (loadMore) {
                        commentsByPostId.value[postId] = [...(commentsByPostId.value[postId] || []), ...fetchedComments];
                    } else {
                        commentsByPostId.value[postId] = fetchedComments;
                    }
                    console.log('fetchedComments', fetchedComments);
                    paginationByPostId.value[postId] = {
                        currentPage: currentPageToFetch + (fetchedComments.length > 0 && fetchedComments.length >= limitToFetch ? 1 : 0), // 只有当获取到数据且可能还有更多时才增加页码
                        pageSize: limitToFetch,
                        totalComments: response.data.total,
                        hasMore: (commentsByPostId.value[postId]?.length || 0) < response.data.total,
                    };
                } else {
                    throw new Error(response.msg || `获取帖子 ${postId} 的评论失败`);
                }
            })
            .catch((err: any) => {
                errorByPostId.value[postId] = err.message || '获取评论时发生错误';
                console.error(`Workspace comments for post ${postId} error:`, err);
                 // 如果加载更多失败，可能需要回滚 currentPage
                if (loadMore && paginationByPostId.value[postId]) {
                    // paginationByPostId.value[postId].currentPage = Math.max(1, paginationByPostId.value[postId].currentPage -1 );
                }
            })
            .finally(() => {
                isLoadingByPostId.value[postId] = false;
            });
    }

    function addComment(commentData: Omit<AddCommentPayload, 'authorId'>): Promise<Comment | null> {
        const userStore = useUserStore();
        if (!userStore.userInfo.id) { // 假设 userStore.userInfo.id 存在且为真时表示已登录
            ElMessage.error('请先登录再操作');
            return Promise.resolve(null);
        }

        const postId = commentData.postId;
        // 可以为特定帖子设置一个“提交中”的状态
        // isLoadingByPostId.value[`submit_${postId}`] = true;
        errorByPostId.value[postId] = null;

        return new Promise((resolve, reject) => {
            apiAddComment(commentData)
                .then((response: TransDef<Comment>) => {
                    if (response.code === 0 && response.data) {
                        ElMessage.success(commentData.parentId ? '回复成功！' : '评论发表成功！');
                        // 刷新评论列表，或者更智能地插入新评论
                        // 当前实现：重新加载第一页，这会包含新的评论并按后端排序
                        return fetchComments(postId, { page: 1, limit: paginationByPostId.value[postId]?.pageSize || 5 })
                            .then(() => resolve(response.data as Comment));
                    } else {
                        throw new Error(response.msg || (commentData.parentId ? '回复失败' : '发表评论失败'));
                    }
                })
                .catch((err: any) => {
                    errorByPostId.value[postId] = err.message;
                    ElMessage.error(err.message || '操作失败');
                    console.error('Add comment error:', err);
                    reject(err);
                })
                .finally(() => {
                    // isLoadingByPostId.value[`submit_${postId}`] = false;
                });
        });
    }

    function deleteComment(commentId: string | number, postId: string | number): Promise<boolean> {
        const userStore = useUserStore();
         if (!userStore.userInfo.id) {
            ElMessage.error('请先登录再操作');
            return Promise.resolve(false);
        }
        // isLoadingByPostId.value[`delete_${commentId}`] = true;
        errorByPostId.value[postId] = null;

        return new Promise((resolve, reject) => {
            apiDeleteComment(commentId)
                .then((response: TransDef<null>) => {
                    if (response.code === 0) {
                        ElMessage.success('评论删除成功！');
                        // 刷新列表
                        return fetchComments(postId, { page: 1, limit: paginationByPostId.value[postId]?.pageSize || 5 });
                    } else {
                        throw new Error(response.msg || '删除评论失败');
                    }
                })
                .then(() => {
                    resolve(true);
                })
                .catch((err: any) => {
                    errorByPostId.value[postId] = err.message;
                    ElMessage.error(err.message || '删除评论操作失败');
                    console.error(`Delete comment ${commentId} error:`, err);
                    reject(err); // 让 CommentItem 知道失败了
                })
                .finally(() => {
                    // isLoadingByPostId.value[`delete_${commentId}`] = false;
                });
        });
    }

    function toggleLikeComment(commentId: string | number, postId: string | number): Promise<ToggleLikeCommentResponseData | null> {
         const userStore = useUserStore();
         if (!userStore.userInfo.id) {
            ElMessage.error('请先登录再操作');
            return Promise.reject(new Error('用户未登录')); // 返回 rejected Promise
        }
        // LikeButton 自身有 isLoading 状态

        return new Promise((resolve, reject) => {
            apiToggleLikeComment(commentId)
                .then((response: TransDef<ToggleLikeCommentResponseData>) => {
                    if (response.code === 0 && response.data) {
                        const postComments = commentsByPostId.value[postId];
                        if (postComments) {
                            // 使用辅助函数更新
                            const success = updateCommentInList(postComments, commentId, (comment) => {
                                comment.isLikedByCurrentUser = response.data!.isLiked;
                                comment.likesCount = response.data!.likesCount;
                            });
                            if (success) {
                                commentsByPostId.value[postId] = [...postComments]; // 触发响应式更新
                            }
                        }
                        // ElMessage.success(response.data.isLiked ? '点赞成功' : '取消点赞成功'); // LikeButton 内部可能会有提示
                        resolve(response.data);
                    } else {
                        throw new Error(response.msg || '评论点赞操作失败');
                    }
                })
                .catch((err: any) => {
                    ElMessage.error(err.message || '评论点赞操作时发生错误');
                    console.error(`Toggle like for comment ${commentId} error:`, err);
                    reject(err); // 让调用方 (LikeButton 或 CommentItem) 知道失败了
                });
        });
    }


    return {
        commentsByPostId,
        isLoadingByPostId,
        errorByPostId,
        paginationByPostId,
        getCommentsForPost,
        getIsLoadingForPost,
        getErrorForPost,
        getPaginationForPost,
        fetchComments,
        addComment,
        deleteComment,
        toggleLikeComment,
    };
});