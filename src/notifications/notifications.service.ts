import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
// import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { PushNotificationService } from 'src/aliyun-Notification/push-notification.service';
import { NotificationType } from 'src/aliyun-Notification/dto/notification-payload.dto';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('NotificationsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly userService: UserService,
  ) { }

  /**
   * Create a new notification and store it in the database
   */
  async createNotification(createNotificationDto: CreateNotificationDto) {
    try {
      // Access the notifications model using any to bypass TypeScript type checking
      const notification = await (this.prisma as any).notifications.create({
        data: {
          id: uuidv4(),
          userId: createNotificationDto.userId,
          content: createNotificationDto.content,
          type: createNotificationDto.type,
          read: false,
          metadata: createNotificationDto.metadata || {},
          updatedAt: new Date(),
        },
      });

      // If a notification is created for a comment/reply, send a push notification
      if (
        notification.type === 'MOMENT' &&
        notification.metadata &&
        (notification.metadata['commentId'] || notification.metadata['isReply'])
      ) {
        const senderId = notification.metadata['userId'];

        // Send push notification
        await this.pushNotificationService.sendPushNotification({
          userIds: [notification.userId],
          title: createNotificationDto.title,
          content: notification.content,
          type: NotificationType.MOMENT,
          data: notification.metadata,
        });
      }

      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a notification for a comment on a post
   * Following Facebook-like logic: notify the post owner when someone comments
   */
  async createCommentNotification({
    postId,
    commentId,
    postOwnerId,
    commenterId,
    commenterName,
    postTitle,
  }: {
    postId: string;
    commentId: string;
    postOwnerId: string;
    commenterId: string;
    commenterName: string;
    postTitle: string;
  }) {
    try {
      // Don't notify if the commenter is the post owner (commenting on their own post)
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
    } catch (error) {
      this.logger.error(`Failed to create comment notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a notification for a reply to a comment
   * Following Facebook-like logic: notify both the post owner and the comment owner
   */
  async createReplyNotification({
    postId,
    commentId,
    replyId,
    postOwnerId,
    originalCommentOwnerId,
    replierId,
    replierName,
    commentText,
  }: {
    postId: string;
    commentId: string;
    replyId: string;
    postOwnerId: string;
    originalCommentOwnerId: string;
    replierId: string;
    replierName: string;
    commentText: string;
  }) {
    try {
      const notifications = [];

      // Prepare the notification content
      const content = `${replierName} replied to a comment: "${this.truncateText(commentText, 30)}"`;

      // Notify the original comment owner (if not the replier)
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

      // Also notify the post owner (if different from comment owner and replier)
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

      // Wait for all notifications to be created
      if (notifications.length > 0) {
        await Promise.all(notifications);
      }

      return { created: notifications.length };
    } catch (error) {
      this.logger.error(`Failed to create reply notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Helper method to truncate text to a specific length
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }

  /**
   * Get all notifications for a user with pagination
   */
  async getNotificationsForUser(userId: string, page = 1, pageSize = 20) {
    try {
      const skip = (page - 1) * pageSize;

      // Log the userId to verify we're getting the right parameter
      this.logger.debug(`Fetching notifications for user: ${userId}`);

      // Debug query parameters
      this.logger.debug(`Skip: ${skip}, Take: ${pageSize}`);

      // Verify if the notifications table exists and is accessible
      try {
        const notificationCount = await (this.prisma as any).notifications.count();
        this.logger.debug(`Total notifications in system: ${notificationCount}`);
      } catch (error) {
        this.logger.error(`Error accessing notifications table: ${error.message}`);
      }

      const [notifications, totalCount] = await Promise.all([
        (this.prisma as any).notifications.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        (this.prisma as any).notifications.count({
          where: { userId },
        }),
      ]);

      // Log the number of notifications found for debugging
      this.logger.debug(`Found ${notifications.length} notifications for user ${userId}`);

      const unreadCount = await (this.prisma as any).notifications.count({
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
    } catch (error) {
      this.logger.error(`Failed to get notifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: string, userId: string) {
    try {
      const notification = await (this.prisma as any).notifications.findFirst({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return (this.prisma as any).notifications.update({
        where: { id: notificationId },
        data: { read: true },
      });
    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string) {
    try {
      return (this.prisma as any).notifications.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadNotificationCount(userId: string) {
    try {
      const count = await (this.prisma as any).notifications.count({
        where: { userId, read: false },
      });

      return { count };
    } catch (error) {
      this.logger.error(`Failed to get unread notification count: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await (this.prisma as any).notifications.findFirst({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return (this.prisma as any).notifications.delete({
        where: { id: notificationId },
      });
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`, error.stack);
      throw error;
    }
  }
}
