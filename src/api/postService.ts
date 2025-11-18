// src/api/postService.ts
import { myRequest } from './myAxios'; // 假设 myAxios.ts 在同级目录 (Assuming myAxios.ts is in the same directory)
import { apiPrefix } from './globalConst';
import type { Post } from '@/types/discuss';
import type { TransDef } from "@/api/type.ts"; // 导入帖子和作者类型 (Import Post and Author types)
// import type {UserProfile as AuthorInfo} from "@/types/user.ts";
// --- 请求体和响应数据的特定类型定义 ---
// (Request body and response data specific type definitions)

/**
 * 获取帖子列表的参数类型
 * Parameters type for fetching post list.
 */
export interface GetPostsParams {
    page?: number;
    limit?: number;
    sortBy?: string; // 例如 'createdAt_desc' (e.g., 'createdAt_desc')
    filterText?: string; // 搜索关键词 (Search keyword)
    category?: string; // 分类 (Category)
    tag?: string; // 标签 (Tag)
    authorId?: string | number; // 作者ID (Author ID)
}

/**
 * 获取帖子列表API的响应数据中 `data` 字段的结构
 * Structure of the `data` field in the response for getPosts API.
 */
export interface GetPostsResponseData {
    items: Post[];
    total: number;
    currentPage?: number; // (可选) 后端可以返回当前页 (Optional: Backend can return current page)
    pageSize?: number;    // (可选) 后端可以返回每页数量 (Optional: Backend can return page size)
}

/**
 * 创建帖子的请求体类型
 * Request body type for creating a post.
 */
export interface CreatePostBody extends Omit<Post, 'id' | 'createdAt' | 'author' | 'likesCount' | 'commentsCount' | 'viewCount' | 'updatedAt' | 'isLikedByCurrentUser'> {
    // 通常后端会根据当前登录用户自动设置作者ID，或者前端需要传递
    // Usually, the backend automatically sets the author ID based on the logged-in user, or the frontend needs to pass it.
    // authorId: string | number; // 如果需要前端传递 (If frontend needs to pass it)
}

/**
 * 更新帖子的请求体类型
 * Request body type for updating a post.
 */
export type UpdatePostBody = Partial<Omit<Post, 'id' | 'author' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'viewCount' | 'isLikedByCurrentUser'>>;


// --- API 服务函数 ---
// (API Service Functions)

/**
 * 获取帖子列表
 * Fetches a list of posts.
 * @param params - 查询参数 (Query parameters)
 */
export const apiGetPosts = (params?: GetPostsParams): Promise<TransDef<GetPostsResponseData>> => {
    return myRequest<never, GetPostsResponseData>({
        method: 'GET',
        url: `${apiPrefix}/posts`,
        params: params, // axios 会自动将 params 对象转换成 URL 查询字符串 (axios will automatically convert params object to URL query string)
    });
};

/**
 * 根据ID获取单个帖子详情
 * Fetches a single post detail by ID.
 * @param id - 帖子ID (Post ID)
 */
export const apiGetPostById = (id: string | number): Promise<TransDef<Post>> => {
    return myRequest<never, Post>({
        method: 'GET',
        url: `${apiPrefix}/posts/${id}`,
    });
};

/**
 * 创建新帖子
 * Creates a new post.
 * @param postData - 帖子数据 (Post data)
 */
export const apiCreatePost = (postData: CreatePostBody): Promise<TransDef<Post>> => {
    // 注意：实际的 authorId 应该由后端根据认证信息设置，或由 userStore 提供
    // Note: The actual authorId should be set by the backend based on authentication info, or provided by userStore
    return myRequest<CreatePostBody, Post>({
        method: 'POST',
        url: `${apiPrefix}/posts`,
        data: postData,
    });
};

/**
 * 更新指定ID的帖子
 * Updates a post with the given ID.
 * @param id - 帖子ID (Post ID)
 * @param postData - 要更新的帖子数据 (Post data to update)
 */
export const apiUpdatePost = (id: string | number, postData: UpdatePostBody): Promise<TransDef<Post>> => {
    return myRequest<UpdatePostBody, Post>({
        method: 'PUT', // 或 'PATCH' (or 'PATCH')
        url: `${apiPrefix}/posts/${id}`,
        data: postData,
    });
};

/**
 * 删除指定ID的帖子
 * Deletes a post with the given ID.
 * @param id - 帖子ID (Post ID)
 */
export const apiDeletePost = (id: string | number): Promise<TransDef<null>> => { // 通常删除成功后 data 为 null 或空对象 (Usually data is null or empty object after successful deletion)
    return myRequest<never, null>({
        method: 'DELETE',
        url: `${apiPrefix}/posts/${id}`,
    });
};

/**
 * 切换帖子点赞状态
 * Toggles the like status of a post.
 * @param id - 帖子ID (Post ID)
 * @param currentUserId - (可选) 当前用户ID，后端可能需要 (Optional: current user ID, backend might need it)
 */
export interface ToggleLikeResponseData {
    isLiked: boolean;
    likesCount: number;
}
export interface ToggleCollectResponseData {
    isCollected: boolean;
    collectCount: number;
}
export const apiToggleLikePost = (id: string | number, /* currentUserId?: string | number */): Promise<TransDef<ToggleLikeResponseData>> => {
    // 后端API设计可能不同，这里假设一个简单的切换接口
    // Backend API design might differ, assuming a simple toggle endpoint here
    return myRequest<never, ToggleLikeResponseData>({
        method: 'POST', // 或者 'PUT' (or 'PUT')
        url: `${apiPrefix}/posts/${id}/toggle-like`,
        // data: { userId: currentUserId } // 如果后端需要知道是哪个用户操作的 (If backend needs to know which user performed the action)
    });
};


/**
 * 切换帖子收藏状态
 * Toggles the like status of a post.
 * @param id - 帖子ID (Post ID)
 * @param currentUserId - (可选) 当前用户ID，后端可能需要 (Optional: current user ID, backend might need it)
 */
export interface ToggleCollectResponseData {
    isCollected: boolean;
    collectCount: number;
}
export const apiToggleCollectPost = (id: string | number, /* currentUserId?: string | number */): Promise<TransDef<ToggleCollectResponseData>> => {
    return myRequest<never, ToggleCollectResponseData>({
        method: 'POST',
        url: `${apiPrefix}/posts/${id}/toggle-collect`,
        // data: { userId: currentUserId } // 如果后端需要知道是哪个用户操作的 (If backend needs to know which user performed the action)
    });
};

// 活跃用户列表
export interface ActiveUserVO {
    userId: number;
    username: string;
    avatar?: string;
    postCount: number;
}

/**
 * 获取活跃用户列表
 */
export const apiGetActiveUsers = (): Promise<TransDef<ActiveUserVO[]>> => {
    return myRequest<never, ActiveUserVO[]>({
        method: 'GET',
        url: `${apiPrefix}/posts/active-users`,
    });
};

// 社区统计信息
export interface CommunityStatsVO {
    totalPosts: number;
    totalUsers: number;
    todayNewPosts: number;
}

/**
 * 获取社区统计信息
 */
export const apiGetCommunityStats = (): Promise<TransDef<CommunityStatsVO>> => {
    return myRequest<never, CommunityStatsVO>({
        method: 'GET',
        url: `${apiPrefix}/community/stats`,
    });
};

// 社区概览（包含课程与帖子相关的统计）
export interface CommunityOverviewVO {
    currentPeriodCourses: number; // 当前时段课程总数
    todayCourses: number; // 今日课程总数
    todayPosts: number; // 今日帖子总数
}

export const apiGetCommunityOverview = (): Promise<TransDef<CommunityOverviewVO>> => {
    return myRequest<never, CommunityOverviewVO>({
        method: 'GET',
        url: `${apiPrefix}/community/overview`,
    });
};

