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
} from '@/api/commentService';
import { useUserStore } from './userStore';
import type { TransDef } from '@/api/type.ts';

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

    function fetchComments(postId: string | number, params: GetCommentsParams = {}, loadMore = false): Promise<void> {
        isLoadingByPostId.value[postId] = true;
        errorByPostId.value[postId] = null;

        const currentPageToFetch = loadMore ? (paginationByPostId.value[postId]?.currentPage || 1) : 1;
        const limitToFetch = params.limit || paginationByPostId.value[postId]?.pageSize || 5;

        if (!loadMore) {
            commentsByPostId.value[postId] = []; // 清空旧数据以便刷新
        }

        return apiGetCommentsByPostId(postId, { ...params, page: currentPageToFetch, limit: limitToFetch })
            .then((response: TransDef<GetCommentsResponseData>) => {
                if (response.code === 0 && response.data) {
                    const fetchedComments = response.data.items;
                    if (loadMore) {
                        commentsByPostId.value[postId] = [...(commentsByPostId.value[postId] || []), ...fetchedComments];
                    } else {
                        commentsByPostId.value[postId] = fetchedComments;
                    }
                    paginationByPostId.value[postId] = {
                        currentPage: currentPageToFetch + (fetchedComments.length > 0 ? 1 : 0),
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
                console.error(`Fetch comments for post ${postId} error:`, err);
            })
            .finally(() => {
                isLoadingByPostId.value[postId] = false;
            });
    }

    function addComment(commentData: Omit<AddCommentPayload, 'authorId'>): Promise<Comment | null> {
        const userStore = useUserStore();
        if (!userStore.userInfo.id) {
            ElMessage.error('请先登录再发表评论');
            return Promise.resolve(null);
        }
        // isLoadingByPostId.value[commentData.postId] = true; // 可以在提交时设置特定加载状态
        errorByPostId.value[commentData.postId] = null;

        return new Promise((resolve, reject) => {
            apiAddComment(commentData)
                .then((response: TransDef<Comment>) => {
                    if (response.code === 0 && response.data) {
                        ElMessage.success('评论发表成功！');
                        // 刷新评论列表
                        return fetchComments(commentData.postId, { page: 1 })
                            .then(() => resolve(response.data));
                    } else {
                        throw new Error(response.msg || '发表评论失败');
                    }
                })
                .catch((err: any) => {
                    errorByPostId.value[commentData.postId] = err.message || '发表评论时发生错误';
                    ElMessage.error(errorByPostId.value[commentData.postId] as string);
                    console.error('Add comment error:', err);
                    reject(err);
                })
                .finally(() => {
                    // isLoadingByPostId.value[commentData.postId] = false;
                });
        });
    }

    function deleteComment(commentId: string | number, postId: string | number): Promise<boolean> {
        const userStore = useUserStore();
        if (!userStore.userInfo.id) {
            ElMessage.error('请先登录');
            return Promise.resolve(false);
        }
        // isLoadingByPostId.value[postId] = true;
        errorByPostId.value[postId] = null;

        return new Promise((resolve, reject) => {
            apiDeleteComment(commentId) // 后端应校验权限
                .then((response: TransDef<null>) => {
                    if (response.code === 0) {
                        ElMessage.success('评论删除成功！');
                        return fetchComments(postId, { page: 1 }); // 刷新列表
                    } else {
                        throw new Error(response.msg || '删除评论失败');
                    }
                })
                .then(() => {
                    resolve(true);
                })
                .catch((err: any) => {
                    errorByPostId.value[postId] = err.message || '删除评论时发生错误';
                    ElMessage.error(errorByPostId.value[postId] as string);
                    console.error(`Delete comment ${commentId} error:`, err);
                    reject(err);
                })
                .finally(() => {
                    // isLoadingByPostId.value[postId] = false;
                });
        });
    }

    function toggleLikeComment(commentId: string | number, postId: string | number): Promise<ToggleLikeCommentResponseData | null> {
        // isLoading 状态由 LikeButton 组件自身管理
        return new Promise((resolve, reject) => {
            apiToggleLikeComment(commentId)
                .then((response: TransDef<ToggleLikeCommentResponseData>) => {
                    if (response.code === 0 && response.data) {
                        const postComments = commentsByPostId.value[postId];
                        if (postComments) {
                            const updateRecursive = (commentsArr: Comment[]): boolean => {
                                for (let i = 0; i < commentsArr.length; i++) {
                                    if (commentsArr[i].id.toString() === commentId.toString()) {
                                        // 确保 Comment 类型定义中有 isLikedByCurrentUser
                                        if ('isLikedByCurrentUser' in commentsArr[i]) {
                                            (commentsArr[i] as any).isLikedByCurrentUser = response.data.isLiked;
                                        }
                                        commentsArr[i].likesCount = response.data.likesCount;
                                        return true;
                                    }
                                    if (commentsArr[i].children && commentsArr[i].children!.length > 0) {
                                        if (updateRecursive(commentsArr[i].children!)) {
                                            return true;
                                        }
                                    }
                                }
                                return false;
                            };
                            if(updateRecursive(postComments)){
                                commentsByPostId.value[postId] = [...postComments]; // 触发响应式更新
                            }
                        }
                        resolve(response.data);
                    } else {
                        throw new Error(response.msg || '评论点赞操作失败');
                    }
                })
                .catch((err: any) => {
                    ElMessage.error(err.message || '评论点赞操作时发生错误');
                    console.error(`Toggle like for comment ${commentId} error:`, err);
                    reject(err);
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
