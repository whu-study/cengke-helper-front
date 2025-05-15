// src/api/commentService.ts
import { myRequest, type TransDef } from './myAxios';
import { apiPrefix } from './globalConst';
import type { Comment } from '@/types/discuss';

// --- 请求体和响应数据类型 ---

/**
 * 获取评论列表的参数类型
 * Parameters type for fetching comment list.
 */
export interface GetCommentsParams {
    page?: number;
    limit?: number;
    sortBy?: string; // 例如 'createdAt_desc' (e.g., 'createdAt_desc')
    // 根据需要添加其他过滤参数 (Add other filter parameters as needed)
}

/**
 * 获取评论列表API的响应数据中 `data` 字段的结构
 * Structure of the `data` field in the response for getComments API.
 */
export interface GetCommentsResponseData {
    items: Comment[];
    total: number;
    currentPage?: number;
    pageSize?: number;
}

/**
 * 添加评论的请求体类型
 * Request body type for adding a comment.
 */
export interface AddCommentPayload {
    postId: string | number;
    content: string;
    parentId?: string | number | null; // 用于回复 (For replies)
    replyToUserId?: string | number;   // 回复的目标用户ID (Target user ID for reply)
    // authorId 通常由后端根据token确定 (authorId is usually determined by the backend based on token)
}

/**
 * 切换评论点赞状态的响应数据类型
 * Response data type for toggling comment like status.
 */
export interface ToggleLikeCommentResponseData {
    isLiked: boolean;
    likesCount: number;
}

// --- API 服务函数 ---

/**
 * 根据帖子ID获取评论列表
 * Fetches a list of comments for a given post ID.
 * @param postId - 帖子ID (Post ID)
 * @param params - 查询参数，如分页 (Query parameters, e.g., pagination)
 */
export const apiGetCommentsByPostId = (postId: string | number, params?: GetCommentsParams): Promise<TransDef<GetCommentsResponseData>> => {
    return myRequest<never, GetCommentsResponseData>({
        method: 'GET',
        url: `${apiPrefix}/posts/${postId}/comments`,
        params: params,
    });
};

/**
 * 添加新评论 (顶级评论或回复)
 * Adds a new comment (top-level or reply).
 * @param commentData - 评论数据 (Comment data)
 */
export const apiAddComment = (commentData: AddCommentPayload): Promise<TransDef<Comment>> => {
    return myRequest<AddCommentPayload, Comment>({
        method: 'POST',
        url: `${apiPrefix}/comments`, // 或 `${apiPrefix}/posts/${commentData.postId}/comments`
        data: commentData,
    });
};

/**
 * 删除指定ID的评论
 * Deletes a comment with the given ID.
 * @param commentId - 评论ID (Comment ID)
 */
export const apiDeleteComment = (commentId: string | number): Promise<TransDef<null>> => {
    return myRequest<never, null>({
        method: 'DELETE',
        url: `${apiPrefix}/comments/${commentId}`,
    });
};

/**
 * 切换评论点赞状态
 * Toggles the like status of a comment.
 * @param commentId - 评论ID (Comment ID)
 */
export const apiToggleLikeComment = (commentId: string | number): Promise<TransDef<ToggleLikeCommentResponseData>> => {
    return myRequest<never, ToggleLikeCommentResponseData>({
        method: 'POST',
        url: `${apiPrefix}/comments/${commentId}/toggle-like`,
    });
};
