import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GetUser } from 'src/decorator';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get all notifications for the current user
   */
  @Get()
  async getNotifications(
    @GetUser('id') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return this.notificationsService.getNotificationsForUser(
      userId,
      page,
      pageSize,
    );
  }

  /**
   * Mark a notification as read
   */
  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @GetUser('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markNotificationAsRead(notificationId, userId);
  }

  /**
   * Mark all notifications as read
   */
  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllNotificationsAsRead(userId);
  }

  /**
   * Get unread notification count
   */
  @Get('unread-count')
  async getUnreadCount(@GetUser('id') userId: string) {
    return this.notificationsService.getUnreadNotificationCount(userId);
  }

  /**
   * Delete a notification
   */
  @Delete(':id')
  async deleteNotification(
    @GetUser('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(notificationId, userId);
  }
}
