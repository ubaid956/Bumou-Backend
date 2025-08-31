import { NotificationsService } from 'src/notifications/notifications.service';
import { UserService } from 'src/user/user.service';
export declare class PushNotificationCommentService {
    private readonly notificationsService;
    private readonly userService;
    private readonly logger;
    constructor(notificationsService: NotificationsService, userService: UserService);
    sendCommentNotification(commenterId: string, postOwnerId: string, postId: string, commentId: string, commentText: string, isReply?: boolean, parentCommentId?: string): Promise<void>;
    private getPostDetails;
    private getCommentDetails;
}
