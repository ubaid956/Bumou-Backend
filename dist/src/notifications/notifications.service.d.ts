import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PushNotificationService } from 'src/aliyun-Notification/push-notification.service';
import { UserService } from 'src/user/user.service';
export declare class NotificationsService {
    private readonly prisma;
    private readonly pushNotificationService;
    private readonly userService;
    private readonly logger;
    constructor(prisma: PrismaService, pushNotificationService: PushNotificationService, userService: UserService);
    createNotification(createNotificationDto: CreateNotificationDto): Promise<any>;
    createCommentNotification({ postId, commentId, postOwnerId, commenterId, commenterName, postTitle, }: {
        postId: string;
        commentId: string;
        postOwnerId: string;
        commenterId: string;
        commenterName: string;
        postTitle: string;
    }): Promise<any>;
    createReplyNotification({ postId, commentId, replyId, postOwnerId, originalCommentOwnerId, replierId, replierName, commentText, }: {
        postId: string;
        commentId: string;
        replyId: string;
        postOwnerId: string;
        originalCommentOwnerId: string;
        replierId: string;
        replierName: string;
        commentText: string;
    }): Promise<{
        created: number;
    }>;
    private truncateText;
    getNotificationsForUser(userId: string, page?: number, pageSize?: number): Promise<{
        notifications: any;
        meta: {
            totalCount: any;
            unreadCount: any;
            page: number;
            pageSize: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    markNotificationAsRead(notificationId: string, userId: string): Promise<any>;
    markAllNotificationsAsRead(userId: string): Promise<any>;
    getUnreadNotificationCount(userId: string): Promise<{
        count: any;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<any>;
}
