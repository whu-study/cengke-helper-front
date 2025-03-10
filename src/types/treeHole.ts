export interface PostMeta {
    type: string;
    text: string;
    url: string;
}

export class PostRecord {
    id: number;
    authorId: number;
    authorName: string;
    commentCount: number;
    upvoteCount: number;
    title: string;
    content: PostMeta[];
    contentJson: string;
    latestRepliedAt: Date; // 毫秒为单位
    createdAt: Date;
    updatedAt: Date;

    constructor(id: number, authorId: number, authorName: string,
                commentCount: number, upvoteCount: number,
                title: string, content: PostMeta[],
                contentJson: string,
                latestRepliedAt: Date, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.authorId = authorId;
        this.authorName = authorName;
        this.commentCount = commentCount;
        this.upvoteCount = upvoteCount;
        this.title = title;
        this.content = content;
        this.contentJson = contentJson;
        this.latestRepliedAt = latestRepliedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}


export interface CreatePostParam {
    authorId: number;
    authorName: string,
    text: string;
    images: File[];
    tags: string;
}

export interface CommentRecord {
    id: number;
    postId: number;
    authorId: number;
    authorName: string;
    content: string;
    floorNum: number;
    createdAt: Date;
}

export class User {
    id: number;
    username: string;
    avatar: string;


    constructor(id: number, username: string, avatar: string) {
        this.id = id;
        this.username = username;
        this.avatar = avatar;
    }
}

export interface StarRecord {
    id: number;
    postId: number;
    userId: number;
    createdAt: Date;
}