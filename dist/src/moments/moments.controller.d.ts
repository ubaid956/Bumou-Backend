import { PaginationRequest } from 'src/utils';
import { AddCommentDto, AddReplyDto, CreatePostDto } from './dto';
import { MomentsService } from './moments.service';
export declare class MomentsController {
    private momentService;
    constructor(momentService: MomentsService);
    getMyPosts(currentUserId: string, query: PaginationRequest): Promise<{
        numberOfLikes: number;
        isLikeByMe: boolean;
        comments: ({
            user: {
                id: string;
                username: string;
                userType: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                profilePicture: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            text: string;
            postId: string;
        })[];
        likes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            postId: string;
        }[];
        user: {
            id: string;
            username: string;
            userType: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            profilePicture: string;
        };
        mediaAttachments: {
            id: string;
            type: import(".prisma/client").$Enums.MediaType;
            postId: string;
            url: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        is_anonymous: boolean;
        text: string | null;
        mood: string | null;
        total_likes: number;
        total_comments: number;
    }[]>;
    getUserPosts(currentUserId: string, userId: string, query: PaginationRequest): Promise<{
        numberOfLikes: number;
        isLikeByMe: boolean;
        comments: ({
            user: {
                id: string;
                username: string;
                userType: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                profilePicture: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            text: string;
            postId: string;
        })[];
        likes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            postId: string;
        }[];
        user: {
            id: string;
            username: string;
            userType: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            profilePicture: string;
        };
        mediaAttachments: {
            id: string;
            type: import(".prisma/client").$Enums.MediaType;
            postId: string;
            url: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        is_anonymous: boolean;
        text: string | null;
        mood: string | null;
        total_likes: number;
        total_comments: number;
    }[]>;
    createPost(userId: string, body: CreatePostDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        is_anonymous: boolean;
        text: string | null;
        mood: string | null;
        total_likes: number;
        total_comments: number;
    }>;
    getPosts(userId: string, page?: number, pageSize?: number, isAnonymous?: boolean): Promise<{
        comments: {
            text: string;
            isReply: boolean;
            parentCommentId: string;
            user: {
                id: string;
                username: string;
                userType: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                profilePicture: string;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            postId: string;
        }[];
        numberOfLikes: number;
        isLikeByMe: boolean;
        likes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            postId: string;
        }[];
        user: {
            id: string;
            username: string;
            userType: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            profilePicture: string;
        };
        mediaAttachments: {
            id: string;
            type: import(".prisma/client").$Enums.MediaType;
            postId: string;
            url: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        is_anonymous: boolean;
        text: string | null;
        mood: string | null;
        total_likes: number;
        total_comments: number;
    }[]>;
    addComment(userId: string, postId: string, body: AddCommentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        text: string;
        postId: string;
    }>;
    getComments(postId: string, page?: number, pageSize?: number): Promise<{
        text: string;
        isReply: boolean;
        parentCommentId: string;
        user: {
            id: string;
            username: string;
            userType: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            profilePicture: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        postId: string;
    }[]>;
    addReply(userId: string, postId: string, commentId: string, body: AddReplyDto): Promise<{
        text: string;
        isReply: boolean;
        parentCommentId: string;
        user: {
            id: string;
            username: string;
            userType: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            profilePicture: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        postId: string;
    }>;
    deleteComment(userId: string, postId: string, commentId: string): Promise<{
        message: string;
    }>;
    likePost(userId: string, postId: string): Promise<{
        message: string;
        isLikeByMe: boolean;
    }>;
    getLikes(postId: string, page?: number, pageSize?: number): Promise<{
        likes: ({
            user: {
                id: string;
                username: string;
                userType: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                profilePicture: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            postId: string;
        })[];
        totalLikesCount: number;
    }>;
    deletePost(userId: string, postId: string): Promise<{
        message: string;
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadComments: number;
        unreadLikes: number;
        totalUnread: number;
    }>;
    markPostAsViewed(userId: string, postId: string): Promise<{
        success: boolean;
    }>;
}
