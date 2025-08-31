import { I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationRequest } from 'src/utils';
import { AddCommentDto, CreatePostDto, AddReplyDto } from './dto';
import { PushNotificationService } from 'src/aliyun-Notification/push-notification.service';
import { PushNotificationCommentService } from 'src/aliyun-Notification/push-notification-comment.service';
export declare class MomentsService {
    private prisma;
    private readonly i18n;
    private readonly pushNotificationService;
    private readonly pushNotificationCommentService;
    constructor(prisma: PrismaService, i18n: I18nService, pushNotificationService: PushNotificationService, pushNotificationCommentService: PushNotificationCommentService);
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
    getMyPosts(userId: string, query: PaginationRequest): Promise<{
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
    getPosts(userId: string, page: number, pageSize: number, isAnonymous?: boolean): Promise<{
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
    getComments(postId: string, page: number, pageSize: number): Promise<{
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
    likePost(userId: string, postId: string): Promise<{
        message: string;
        isLikeByMe: boolean;
    }>;
    getLikes(postId: string, page: number, pageSize: number): Promise<{
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
    private updateTotalLikes;
    private updateTotalComments;
    getUnreadCount(userId: string): Promise<{
        unreadComments: number;
        unreadLikes: number;
        totalUnread: number;
    }>;
    markPostAsViewed(userId: string, postId: string): Promise<{
        success: boolean;
    }>;
}
