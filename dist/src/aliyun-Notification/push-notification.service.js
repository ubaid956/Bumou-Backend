"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PushNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
const common_1 = require("@nestjs/common");
const notification_payload_dto_1 = require("./dto/notification-payload.dto");
const user_service_1 = require("../user/user.service");
const aliyun_push_service_1 = require("./aliyun-push.service");
let PushNotificationService = PushNotificationService_1 = class PushNotificationService {
    constructor(userService, aliyunPushService) {
        this.userService = userService;
        this.aliyunPushService = aliyunPushService;
        this.logger = new common_1.Logger(PushNotificationService_1.name);
    }
    async sendPushNotification(payload) {
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
                        }
                        else {
                            await this.aliyunPushService.pushToAndroid(pushParams);
                        }
                        this.logger.log(`Push sent to user ${userId}, device: ${tokenInfo.token}`);
                    }
                    catch (error) {
                        this.logger.error(`Failed to push to device ${tokenInfo.token}: ${error.message}`);
                    }
                }
            }
        }
        catch (error) {
            this.logger.error(`Error in sendPushNotification: ${error.message}`, error.stack);
        }
    }
    async notificationAliPush(payload) {
        this.logger.log('notificationAliPush called - forwarding to sendPushNotification');
        return this.sendPushNotification(payload);
    }
    async sendHelpNotification(data, userIds) {
        try {
            const notificationPayload = {
                userIds: userIds,
                type: notification_payload_dto_1.NotificationType.HELP,
                title: '🚨 Help Request',
                content: data.enHelpMessage || 'Someone needs help!',
                data: data,
            };
            await this.sendPushNotification(notificationPayload);
        }
        catch (error) {
            this.logger.error('Error in sending help notification', error.stack);
        }
    }
    async sendMessageNotification(chatMessage) {
        const notificationPayload = {
            userIds: [chatMessage.receiverId],
            type: notification_payload_dto_1.NotificationType.MESSAGE,
            content: chatMessage.message,
            title: chatMessage.senderName,
            data: {
                sender: chatMessage.senderId,
                type: chatMessage.type,
            },
        };
        await this.sendPushNotification(notificationPayload);
    }
    async sendCommentNotification(commentData) {
        const notificationPayload = {
            userIds: [commentData.postOwnerId],
            type: notification_payload_dto_1.NotificationType.MOMENT,
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
    async sendLikeNotification(likeData) {
        const notificationPayload = {
            userIds: [likeData.postOwnerId],
            type: notification_payload_dto_1.NotificationType.MOMENT,
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
};
exports.PushNotificationService = PushNotificationService;
exports.PushNotificationService = PushNotificationService = PushNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        aliyun_push_service_1.AliyunPushService])
], PushNotificationService);
//# sourceMappingURL=push-notification.service.js.map