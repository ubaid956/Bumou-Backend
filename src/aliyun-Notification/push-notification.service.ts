import { Injectable, Logger } from '@nestjs/common';
import { NotificationPayloadDto, NotificationType } from 'src/aliyun-Notification/dto/notification-payload.dto';
import { UserService } from 'src/user/user.service';
import { AliyunPushService } from './aliyun-push.service';

@Injectable()
export class PushNotificationService {
    private readonly logger = new Logger(PushNotificationService.name);

    constructor(
        private readonly userService: UserService,
        private readonly aliyunPushService: AliyunPushService,
    ) { }

    async sendPushNotification(payload: NotificationPayloadDto) {
        try {
            for (const userId of payload.userIds) {
                const deviceTokens = await this.userService.getDeviceTokens(userId);

                for (const tokenInfo of deviceTokens) {
                    const pushParams = {
                        deviceToken: tokenInfo.token,
                        title: payload.title || 'Notification',
                        content: payload.content || '',
                        data: {
                            type: payload.type,
                            ...payload.data,
                        },
                        appKey: tokenInfo.device_type === 'ios' ? 335278915 : 334974694
                    };

                    try {
                        if (tokenInfo.device_type === 'ios') {
                            await this.aliyunPushService.pushToIOS(pushParams);
                        } else {
                            await this.aliyunPushService.pushToAndroid(pushParams);
                        }

                        this.logger.log(`Push sent to user ${userId}, device: ${tokenInfo.token}`);
                    } catch (error) {
                        this.logger.error(`Failed to push to device ${tokenInfo.token}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Error in sendPushNotification: ${error.message}`, error.stack);
        }
    }

    // ADD THIS METHOD - This is what your other services are calling
    async notificationAliPush(payload: NotificationPayloadDto) {
        this.logger.log('notificationAliPush called - forwarding to sendPushNotification');
        return this.sendPushNotification(payload);
    }

    async sendHelpNotification(data: any, userIds: string[]) {
        try {
            const notificationPayload: NotificationPayloadDto = {
                userIds: userIds,
                type: NotificationType.HELP,
                title: '🚨 Help Request',
                content: data.enHelpMessage || 'Someone needs help!',
                data: data,
            };

            await this.sendPushNotification(notificationPayload);
        } catch (error) {
            this.logger.error('Error in sending help notification', error.stack);
        }
    }

    async sendMessageNotification(chatMessage: any) {
        const notificationPayload: NotificationPayloadDto = {
            userIds: [chatMessage.receiverId],
            type: NotificationType.MESSAGE,
            content: chatMessage.message,
            title: chatMessage.senderName,
            data: {
                sender: chatMessage.senderId,
                type: chatMessage.type,
            },
        };

        await this.sendPushNotification(notificationPayload);
    }

    async sendCommentNotification(commentData: any) {
        const notificationPayload: NotificationPayloadDto = {
            userIds: [commentData.postOwnerId],
            type: NotificationType.MOMENT,
            title: commentData.isReply ? 'New Reply' : 'New Comment',
            content: commentData.commentText || commentData.content || '',
            data: {
                userId: commentData.commenterId,
                postId: commentData.postId,
                commentId: commentData.commentId,
                isReply: commentData.isReply,
                parentCommentId: commentData.parentCommentId
            },
        };

        await this.sendPushNotification(notificationPayload);
    }

    async sendLikeNotification(likeData: { likerId: string; postOwnerId: string; postId: string; }) {
        const notificationPayload: NotificationPayloadDto = {
            userIds: [likeData.postOwnerId],
            type: NotificationType.MOMENT,
            title: 'New Like',
            content: 'Someone liked your post',
            data: {
                userId: likeData.likerId,
                postId: likeData.postId,
                type: 'like'
            },
        };

        await this.sendPushNotification(notificationPayload);
    }
}