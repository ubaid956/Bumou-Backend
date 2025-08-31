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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const push_notification_service_1 = require("../aliyun-Notification/push-notification.service");
const notification_payload_dto_1 = require("../aliyun-Notification/dto/notification-payload.dto");
const user_service_1 = require("../user/user.service");
const uuid_1 = require("uuid");
let NotificationsService = class NotificationsService {
    constructor(prisma, pushNotificationService, userService) {
        this.prisma = prisma;
        this.pushNotificationService = pushNotificationService;
        this.userService = userService;
        this.logger = new common_1.Logger('NotificationsService');
    }
    async createNotification(createNotificationDto) {
        try {
            const notification = await this.prisma.notifications.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    userId: createNotificationDto.userId,
                    content: createNotificationDto.content,
                    type: createNotificationDto.type,
                    read: false,
                    metadata: createNotificationDto.metadata || {},
                    updatedAt: new Date(),
                },
            });
            if (notification.type === 'MOMENT' &&
                notification.metadata &&
                (notification.metadata['commentId'] || notification.metadata['isReply'])) {
                const senderId = notification.metadata['userId'];
                await this.pushNotificationService.sendPushNotification({
                    userIds: [notification.userId],
                    title: createNotificationDto.title,
                    content: notification.content,
                    type: notification_payload_dto_1.NotificationType.MOMENT,
                    data: notification.metadata,
                });
            }
            return notification;
        }
        catch (error) {
            this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createCommentNotification({ postId, commentId, postOwnerId, commenterId, commenterName, postTitle, }) {
        try {
            if (postOwnerId === commenterId) {
                return null;
            }
            const content = `${commenterName} commented on your post: "${this.truncateText(postTitle, 30)}"`;
            const notificationDto = {
                userId: postOwnerId,
                content,
                title: 'New Comment',
                type: 'MOMENT',
                metadata: {
                    postId,
                    commentId,
                    userId: commenterId,
                    type: 'comment',
                },
            };
            return this.createNotification(notificationDto);
        }
        catch (error) {
            this.logger.error(`Failed to create comment notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createReplyNotification({ postId, commentId, replyId, postOwnerId, originalCommentOwnerId, replierId, replierName, commentText, }) {
        try {
            const notifications = [];
            const content = `${replierName} replied to a comment: "${this.truncateText(commentText, 30)}"`;
            if (originalCommentOwnerId !== replierId) {
                const commentOwnerNotificationDto = {
                    userId: originalCommentOwnerId,
                    content,
                    title: 'New Reply',
                    type: 'MOMENT',
                    metadata: {
                        postId,
                        commentId,
                        replyId,
                        userId: replierId,
                        type: 'reply',
                        isReply: true,
                    },
                };
                notifications.push(this.createNotification(commentOwnerNotificationDto));
            }
            if (postOwnerId !== originalCommentOwnerId && postOwnerId !== replierId) {
                const postOwnerNotificationDto = {
                    userId: postOwnerId,
                    content,
                    title: 'New Reply',
                    type: 'MOMENT',
                    metadata: {
                        postId,
                        commentId,
                        replyId,
                        userId: replierId,
                        type: 'reply',
                        isReply: true,
                    },
                };
                notifications.push(this.createNotification(postOwnerNotificationDto));
            }
            if (notifications.length > 0) {
                await Promise.all(notifications);
            }
            return { created: notifications.length };
        }
        catch (error) {
            this.logger.error(`Failed to create reply notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    truncateText(text, maxLength) {
        if (!text)
            return '';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    }
    async getNotificationsForUser(userId, page = 1, pageSize = 20) {
        try {
            const skip = (page - 1) * pageSize;
            this.logger.debug(`Fetching notifications for user: ${userId}`);
            this.logger.debug(`Skip: ${skip}, Take: ${pageSize}`);
            try {
                const notificationCount = await this.prisma.notifications.count();
                this.logger.debug(`Total notifications in system: ${notificationCount}`);
            }
            catch (error) {
                this.logger.error(`Error accessing notifications table: ${error.message}`);
            }
            const [notifications, totalCount] = await Promise.all([
                this.prisma.notifications.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: pageSize,
                }),
                this.prisma.notifications.count({
                    where: { userId },
                }),
            ]);
            this.logger.debug(`Found ${notifications.length} notifications for user ${userId}`);
            const unreadCount = await this.prisma.notifications.count({
                where: {
                    userId,
                    read: false
                },
            });
            return {
                notifications,
                meta: {
                    totalCount,
                    unreadCount,
                    page,
                    pageSize,
                    totalPages: Math.ceil(totalCount / pageSize),
                    hasNextPage: skip + pageSize < totalCount,
                    hasPreviousPage: page > 1,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get notifications: ${error.message}`, error.stack);
            throw error;
        }
    }
    async markNotificationAsRead(notificationId, userId) {
        try {
            const notification = await this.prisma.notifications.findFirst({
                where: { id: notificationId, userId },
            });
            if (!notification) {
                throw new Error('Notification not found');
            }
            return this.prisma.notifications.update({
                where: { id: notificationId },
                data: { read: true },
            });
        }
        catch (error) {
            this.logger.error(`Failed to mark notification as read: ${error.message}`, error.stack);
            throw error;
        }
    }
    async markAllNotificationsAsRead(userId) {
        try {
            return this.prisma.notifications.updateMany({
                where: { userId, read: false },
                data: { read: true },
            });
        }
        catch (error) {
            this.logger.error(`Failed to mark all notifications as read: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getUnreadNotificationCount(userId) {
        try {
            const count = await this.prisma.notifications.count({
                where: { userId, read: false },
            });
            return { count };
        }
        catch (error) {
            this.logger.error(`Failed to get unread notification count: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            const notification = await this.prisma.notifications.findFirst({
                where: { id: notificationId, userId },
            });
            if (!notification) {
                throw new Error('Notification not found');
            }
            return this.prisma.notifications.delete({
                where: { id: notificationId },
            });
        }
        catch (error) {
            this.logger.error(`Failed to delete notification: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        push_notification_service_1.PushNotificationService,
        user_service_1.UserService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map