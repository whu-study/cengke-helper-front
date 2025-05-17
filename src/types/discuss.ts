import type {UserProfile} from "@/types/user.ts";

/**
 * 帖子信息接口定义
 */
export interface Post {
    id: string | number; // 帖子唯一标识符，可以是字符串或数字
    title: string; // 帖子标题
    content: string; // 帖子主要内容 (可以是 HTML 字符串或 Markdown)
    author: UserProfile; // 帖子作者，类型为上面定义的 User 接口
    // 或者，如果只需要作者ID，可以简化为: authorId: string | number;

    createdAt: string | Date; // 帖子创建时间，可以是 ISO 格式的字符串或 Date 对象
    updatedAt?: string | Date; // 帖子最后更新时间 (可选)

    tags?: string[]; // 帖子标签数组 (可选)
    category?: string; // 帖子分类 (可选)

    viewCount?: number; // 帖子浏览次数 (可选)
    likesCount?: number; // 帖子点赞数量 (可选，PostList.vue 中已使用)
    commentsCount?: number; // 帖子评论数量 (可选，PostList.vue 中已使用)
    collectCount?: number; // 帖子收藏数量 (可选，PostList.vue 中已使用)

    isPublished?: boolean; // 帖子是否已发布 (可选，默认为 true)
    isPinned?: boolean; // 帖子是否置顶 (可选)
    isLocked?: boolean; // 帖子是否被锁定，禁止评论 (可选)

    // 为了配合 PostList.vue 中可能的点赞/收藏状态显示，可以添加以下字段：
    isLikedByCurrentUser?: boolean; // 当前登录用户是否已点赞此帖 
    isCollectedByCurrentUser?: boolean; // 当前登录用户是否已收藏此帖 

    // 可以根据论坛的具体功能添加更多字段，例如：
    // lastCommentAt?: string | Date; // 最后评论时间
    // lastCommentUser?: User; // 最后评论的用户
    // coverImageUrl?: string; // 帖子封面图片链接 (可选)
}


/**
 * 评论信息接口定义
 * 这个接口对应 CommentItem.vue 组件中 `comment` prop 的数据结构。
 */
export interface Comment {
    id: string | number;                // 评论唯一标识符
    author: UserProfile;                     // 评论的作者信息
    content: string;                  // 评论的主要内容文本
    createdAt: string | Date;         // 评论创建时间 (可以是 ISO 格式的字符串或 Date 对象)

    likesCount?: number;               // 评论的点赞数量 (可选, 对应 LikeButton 的 initialLikes)
    isLikedByCurrentUser?: boolean; // 当前登录用户是否已点赞此帖 
    // --- 用于支持回复功能 ---
    postId?: string | number;            // (可选) 此评论所属的帖子ID (如果是一级评论)
    parentId?: string | number | null; // (可选) 如果是回复，则为父评论的ID；如果是一级评论，则为 null 或 undefined
    replyToUser?: UserProfile;                // (可选) 如果是回复，回复的目标用户信息 (在 CommentItem.vue 中已使用)
    children?: Comment[];              // (可选) 嵌套的子回复列表 (CommentItem.vue 中用于递归渲染)

    // --- 其他可能的评论相关字段 ---
    // updatedAt?: string | Date;      // 评论最后更新时间 (可选)
    // isEdited?: boolean;             // 评论是否被编辑过 (可选)
    // isDeleted?: boolean;            // 评论是否已被标记为删除 (可选, 用于软删除)
    // reportsCount?: number;          // 评论被举报的次数 (可选)
}