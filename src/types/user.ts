export interface UserProfile {
    id: number | string;
    username: string;
    email: string;
    avatar: string;
    bio: string;
    role: number | string;
    createdAt: Date;
    // 以下为后端 ExtendedUserProfileVO 扩展的统计字段（可选）
    postsCount?: number;
    commentsCount?: number;
    likesCount?: number; // 用户自己做出的点赞数
    likesReceived?: number; // 收到的点赞数
}