export interface UserProfile {
    id: number|string;
    username: string;
    email: string;
    avatar: string;
    bio: string;
    role: number;
    createdAt: Date;
}