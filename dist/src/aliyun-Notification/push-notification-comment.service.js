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
exports.PushNotificationCommentService = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("../notifications/notifications.service");
const user_service_1 = require("../user/user.service");
let PushNotificationCommentService = class PushNotificationCommentService {
    constructor(notificationsService, userService) {
        this.notificationsService = notificationsService;
        this.userService = userService;
        this.logger = new common_1.Logger('PushNotificationCommentService');
    }
    async sendCommentNotification(commenterId, postOwnerId, postId, commentId, commentText, isReply = false, parentCommentId) {
        try {
            if (commenterId === postOwnerId && !isReply) {
                return;
            }
            const commenter = await this.userService.getUserById(commenterId);
            if (!commenter) {
                this.logger.error(`Commenter with ID ${commenterId} not found`);
                return;
            }
            const commenterName = `${commenter.firstName} ${commenter.lastName}`;
            if (isReply && parentCommentId) {
                const parentComment = await this.getCommentDetails(parentCommentId);
                if (!parentComment) {
                    this.logger.error(`Parent comment with ID ${parentCommentId} not found`);
                    return;
                }
                await this.notificationsService.createReplyNotification({
                    postId,
                    commentId: parentCommentId,
                    replyId: commentId,
                    postOwnerId,
                    originalCommentOwnerId: parentComment.userId,
                    replierId: commenterId,
                    replierName: commenterName,
                    commentText,
                });
            }
            else {
                const post = await this.getPostDetails(postId);
                if (!post) {
                    this.logger.error(`Post with ID ${postId} not found`);
                    return;
                }
                await this.notificationsService.createCommentNotification({
                    postId,
                    commentId,
                    postOwnerId,
                    commenterId,
                    commenterName,
                    postTitle: post.text || 'a post',
                });
            }
        }
        catch (error) {
            this.logger.error(`Error sending comment notification: ${error.message}`, error.stack);
        }
    }
    async getPostDetails(postId) {
        try {
            const post = await this.userService['prisma'].post.findUnique({
                where: { id: postId },
                select: {
                    text: true,
                    userId: true,
                },
            });
            return post;
        }
        catch (error) {
            this.logger.error(`Error getting post details: ${error.message}`);
            return null;
        }
    }
    async getCommentDetails(commentId) {
        try {
            const comment = await this.userService['prisma'].comment.findUnique({
                where: { id: commentId },
                select: {
                    userId: true,
                    text: true,
                },
            });
            return comment;
        }
        catch (error) {
            this.logger.error(`Error getting comment details: ${error.message}`);
            return null;
        }
    }
};
exports.PushNotificationCommentService = PushNotificationCommentService;
exports.PushNotificationCommentService = PushNotificationCommentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        user_service_1.UserService])
], PushNotificationCommentService);
//# sourceMappingURL=push-notification-comment.service.js.map