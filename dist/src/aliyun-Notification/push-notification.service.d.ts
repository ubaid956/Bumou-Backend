import { NotificationPayloadDto } from 'src/aliyun-Notification/dto/notification-payload.dto';
import { UserService } from 'src/user/user.service';
import { AliyunPushService } from './aliyun-push.service';
export declare class PushNotificationService {
    private readonly userService;
    private readonly aliyunPushService;
    private readonly logger;
    constructor(userService: UserService, aliyunPushService: AliyunPushService);
    sendPushNotification(payload: NotificationPayloadDto): Promise<void>;
    notificationAliPush(payload: NotificationPayloadDto): Promise<void>;
    sendHelpNotification(data: any, userIds: string[]): Promise<void>;
    sendMessageNotification(chatMessage: any): Promise<void>;
    sendCommentNotification(commentData: any): Promise<void>;
    sendLikeNotification(likeData: {
        likerId: string;
        postOwnerId: string;
        postId: string;
    }): Promise<void>;
}
