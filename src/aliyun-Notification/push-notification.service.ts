import { Injectable, Logger } from '@nestjs/common';
import { NotificationPayloadDto, NotificationType } from 'src/aliyun-Notification/dto/notification-payload.dto';
import { UserService } from 'src/user/user.service';
import { AliyunPushService } from './aliyun-push.service';

@Injectable()
export class PushNotificationService {
    private readonly logger = new Logger(PushNotificationService.name);
    // In-memory cache to prevent duplicate notifications being sent
    // Key format: `${userId}:${type}:${content}:${JSON.stringify(data)}`
    // Value: timestamp (ms) when it was last sent
    private recentNotifications: Map<string, number> = new Map();

    // Separate cache for private chat messages to handle duplicates more precisely
    private privateChatNotifications: Map<string, number> = new Map();

    // TTL for dedupe window in milliseconds
    private readonly DEDUPE_TTL_MS = 10000; // Increased to 10 seconds for better deduplication

    constructor(
        private readonly userService: UserService,
        private readonly aliyunPushService: AliyunPushService,
    ) { }

    async sendPushNotification(payload: NotificationPayloadDto) {
        try {
            // Ensure we only attempt to send one notification per unique user
            const uniqueUserIds = Array.from(new Set(payload.userIds || []));

            for (const userId of uniqueUserIds) {
                const deviceTokens = await this.userService.getDeviceTokens(userId) || [];

                // Deduplicate device tokens for a user by token value to avoid sending the same push twice
                const seen = new Set<string>();
                const uniqueDeviceTokens = [] as typeof deviceTokens;
                for (const tokenInfo of deviceTokens) {
                    const token = tokenInfo?.token;
                    if (!token) continue;
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

                    // Dedupe key - keep it compact
                    const dedupeKey = `${userId}:${payload.type}:${pushParams.content}:${JSON.stringify(payload.data || {})}`;

                    // Cleanup old entries
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
                        } else {
                            await this.aliyunPushService.pushToAndroid(pushParams);
                        }

                        // record into dedupe cache only after successful send
                        this.recentNotifications.set(dedupeKey, Date.now());

                        this.logger.log(`✅ Push sent successfully to user ${userId}, device: ${tokenInfo.token}`);
                    } catch (error) {
                        this.logger.error(`❌ Failed to push to device ${tokenInfo.token}: ${error.message}`);
                        this.logger.error(`❌ Push error details: ${JSON.stringify(error, null, 2)}`);
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
        const requestId = Math.random().toString(36).substring(7);
        this.logger.log(`📨 [REQ:${requestId}] sendMessageNotification called for message from ${chatMessage.senderId} to ${chatMessage.receiverId}`);

        try {
            // Create multiple deduplication keys for maximum protection
            const messageHash = `${chatMessage.senderId}:${chatMessage.receiverId}:${chatMessage.message}`;
            const timeBasedKey = `${messageHash}:${Math.floor(Date.now() / 1000)}`; // 1-second precision
            const chatroomKey = `${messageHash}:${chatMessage.chatroomId || 'unknown'}`;

            const now = Date.now();

            // Clean up old entries first
            this.cleanupOldNotifications();

            // Check all possible duplicate scenarios
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

            // Fetch sender user information to get the sender name
            const senderUser = await this.userService.getUserById(chatMessage.senderId);
            const senderName = senderUser?.username || 'Someone';

            this.logger.log(`💬 [REQ:${requestId}] Processing private chat notification: ${senderName} -> User ${chatMessage.receiverId}`);

            const notificationPayload: NotificationPayloadDto = {
                userIds: [chatMessage.receiverId],
                type: NotificationType.MESSAGE,
                content: chatMessage.message,
                title: senderName, // Now properly displays sender name like "obaidzeb"
                data: {
                    sender: chatMessage.senderId,
                    senderName: senderName,
                    type: chatMessage.type,
                    chatroomId: chatMessage.chatroomId
                },
            };

            // Send the notification
            await this.sendPushNotification(notificationPayload);

            // Record ALL deduplication keys to prevent any form of duplicate
            for (const key of duplicateKeys) {
                this.privateChatNotifications.set(key, now);
            }

            this.logger.log(`✅ [REQ:${requestId}] Private chat notification sent successfully`);
        } catch (error) {
            this.logger.error(`❌ [REQ:${requestId}] Failed to send private chat notification: ${error.message}`);
        }
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

    /**
     * Clean up old notifications from memory to prevent memory leaks
     */
    private cleanupOldNotifications() {
        const now = Date.now();

        // Clean up general notifications cache
        for (const [key, timestamp] of this.recentNotifications) {
            if (now - timestamp > this.DEDUPE_TTL_MS) {
                this.recentNotifications.delete(key);
            }
        }

        // Clean up private chat notifications cache
        for (const [key, timestamp] of this.privateChatNotifications) {
            if (now - timestamp > this.DEDUPE_TTL_MS) {
                this.privateChatNotifications.delete(key);
            }
        }
    }
}