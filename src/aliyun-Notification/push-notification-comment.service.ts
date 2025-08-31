import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UserService } from 'src/user/user.service';
import { NotificationType } from './dto/notification-payload.dto';

@Injectable()
export class PushNotificationCommentService {
    private readonly logger = new Logger('PushNotificationCommentService');

    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly userService: UserService,
    ) { }

    /**
     * Send a notification for a comment on a post
     * @param commenterId ID of the user who made the comment
     * @param postOwnerId ID of the user who owns the post
     * @param postId ID of the post
     * @param commentId ID of the comment
     * @param commentText Text of the comment
     * @param isReply Whether this is a reply to a comment
     * @param parentCommentId ID of the parent comment if this is a reply
     */
    async sendCommentNotification(
        commenterId: string,
        postOwnerId: string,
        postId: string,
        commentId: string,
        commentText: string,
        isReply: boolean = false,
        parentCommentId?: string,
    ) {
        try {
            // Don't send notification if commenter is the post owner
            if (commenterId === postOwnerId && !isReply) {
                return;
            }

            // Get commenter details
            const commenter = await this.userService.getUserById(commenterId);
            if (!commenter) {
                this.logger.error(`Commenter with ID ${commenterId} not found`);
                return;
            }

            // Format commenter name
            const commenterName = `${commenter.firstName} ${commenter.lastName}`;

            if (isReply && parentCommentId) {
                // Get parent comment details
                const parentComment = await this.getCommentDetails(parentCommentId);
                if (!parentComment) {
                    this.logger.error(`Parent comment with ID ${parentCommentId} not found`);
                    return;
                }

                // For replies, we need to notify both the post owner and comment owner
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
            } else {
                // For regular comments, notify the post owner
                // Get post details to include in notification
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
        } catch (error) {
            this.logger.error(`Error sending comment notification: ${error.message}`, error.stack);
        }
    }

    /**
     * Get basic post details by ID
     * @param postId Post ID
     */
    private async getPostDetails(postId: string) {
        try {
            // We need to use any here since we're accessing the posts table which may not be strongly typed
            const post = await (this.userService['prisma'] as any).post.findUnique({
                where: { id: postId },
                select: {
                    text: true,  // Using text field instead of title which doesn't exist
                    userId: true,
                },
            });
            return post;
        } catch (error) {
            this.logger.error(`Error getting post details: ${error.message}`);
            return null;
        }
    }

    /**
     * Get basic comment details by ID
     * @param commentId Comment ID
     */
    private async getCommentDetails(commentId: string) {
        try {
            // We need to use any here since we're accessing the comments table which may not be strongly typed
            const comment = await (this.userService['prisma'] as any).comment.findUnique({
                where: { id: commentId },
                select: {
                    userId: true,
                    text: true,
                },
            });
            return comment;
        } catch (error) {
            this.logger.error(`Error getting comment details: ${error.message}`);
            return null;
        }
    }
}