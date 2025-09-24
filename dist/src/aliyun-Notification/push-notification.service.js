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
        this.recentNotifications = new Map();
        this.privateChatNotifications = new Map();
        this.DEDUPE_TTL_MS = 10000;
    }
    async sendPushNotification(payload) {
        try {
            const uniqueUserIds = Array.from(new Set(payload.userIds || []));
            for (const userId of uniqueUserIds) {
                const deviceTokens = await this.userService.getDeviceTokens(userId) || [];
                const seen = new Set();
                const uniqueDeviceTokens = [];
                for (const tokenInfo of deviceTokens) {
                    const token = tokenInfo?.token;
                    if (!token)
                        continue;
                    if (seen.has(token)) {
                        this.logger.log(`Skipping duplicate device token for user ${userId}: ${token}`);
                        continue;
                    }
                    seen.add(token);
                    uniqueDeviceTokens.push(tokenInfo);
                }
                for (const tokenInfo of uniqueDeviceTokens) {
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
                    const dedupeKey = `${userId}:${payload.type}:${pushParams.content}:${JSON.stringify(payload.data || {})}`;
                    const now = Date.now();
                    for (const [k, ts] of this.recentNotifications) {
                        if (now - ts > this.DEDUPE_TTL_MS) {
                            this.recentNotifications.delete(k);
                        }
                    }
                    if (this.recentNotifications.has(dedupeKey)) {
                        this.logger.log(`Skipping recently sent notification (deduped): ${dedupeKey}`);
                        continue;
                    }
                    try {
                        this.logger.log(`📱 Attempting to send push notification to ${tokenInfo.device_type} device: ${tokenInfo.token}`);
                        if (tokenInfo.device_type === 'ios') {
                            await this.aliyunPushService.pushToIOS(pushParams);
                        }
                        else {
                            await this.aliyunPushService.pushToAndroid(pushParams);
                        }
                        this.recentNotifications.set(dedupeKey, Date.now());
                        this.logger.log(`✅ Push sent successfully to user ${userId}, device: ${tokenInfo.token}`);
                    }
                    catch (error) {
                        this.logger.error(`❌ Failed to push to device ${tokenInfo.token}: ${error.message}`);
                        this.logger.error(`❌ Push error details: ${JSON.stringify(error, null, 2)}`);
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
        const requestId = Math.random().toString(36).substring(7);
        this.logger.log(`📨 [REQ:${requestId}] sendMessageNotification called for message from ${chatMessage.senderId} to ${chatMessage.receiverId}`);
        try {
            const messageHash = `${chatMessage.senderId}:${chatMessage.receiverId}:${chatMessage.message}`;
            const timeBasedKey = `${messageHash}:${Math.floor(Date.now() / 1000)}`;
            const chatroomKey = `${messageHash}:${chatMessage.chatroomId || 'unknown'}`;
            const now = Date.now();
            this.cleanupOldNotifications();
            const duplicateKeys = [messageHash, timeBasedKey, chatroomKey];
            let isDuplicate = false;
            let matchedKey = '';
            for (const key of duplicateKeys) {
                if (this.privateChatNotifications.has(key)) {
                    const lastSent = this.privateChatNotifications.get(key) || 0;
                    if (now - lastSent <= this.DEDUPE_TTL_MS) {
                        isDuplicate = true;
                        matchedKey = key;
                        break;
                    }
                }
            }
            if (isDuplicate) {
                this.logger.log(`🚫 [REQ:${requestId}] BLOCKED duplicate private chat notification: ${matchedKey}`);
                return;
            }
            const senderUser = await this.userService.getUserById(chatMessage.senderId);
            const senderName = senderUser?.username || 'Someone';
            this.logger.log(`💬 [REQ:${requestId}] Processing private chat notification: ${senderName} -> User ${chatMessage.receiverId}`);
            const notificationPayload = {
                userIds: [chatMessage.receiverId],
                type: notification_payload_dto_1.NotificationType.MESSAGE,
                content: chatMessage.message,
                title: senderName,
                data: {
                    sender: chatMessage.senderId,
                    senderName: senderName,
                    type: chatMessage.type,
                    chatroomId: chatMessage.chatroomId
                },
            };
            await this.sendPushNotification(notificationPayload);
            for (const key of duplicateKeys) {
                this.privateChatNotifications.set(key, now);
            }
            this.logger.log(`✅ [REQ:${requestId}] Private chat notification sent successfully`);
        }
        catch (error) {
            this.logger.error(`❌ [REQ:${requestId}] Failed to send private chat notification: ${error.message}`);
        }
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
    cleanupOldNotifications() {
        const now = Date.now();
        for (const [key, timestamp] of this.recentNotifications) {
            if (now - timestamp > this.DEDUPE_TTL_MS) {
                this.recentNotifications.delete(key);
            }
        }
        for (const [key, timestamp] of this.privateChatNotifications) {
            if (now - timestamp > this.DEDUPE_TTL_MS) {
                this.privateChatNotifications.delete(key);
            }
        }
    }
};
exports.PushNotificationService = PushNotificationService;
exports.PushNotificationService = PushNotificationService = PushNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        aliyun_push_service_1.AliyunPushService])
], PushNotificationService);
//# sourceMappingURL=push-notification.service.js.map