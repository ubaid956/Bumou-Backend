import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatroomMessageStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
// import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { PushNotificationService } from 'src/aliyun-Notification/push-notification.service';
import {
  NotificationPayloadDto,
  NotificationType,
} from 'src/aliyun-Notification/dto/notification-payload.dto';

@Injectable()
export class HelpChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotificationService: PushNotificationService
  ) { }

  async handleNewHelpMessage(payload: any) {
    console.log('Help message received: ', payload);
    try {
      const message = await this.prisma.helpMessage.create({
        data: {
          message: payload.message,
          helpId: payload.helpId,
          senderId: payload.senderId,
          reply_id: payload.reply_id,
          status: ChatroomMessageStatus.SENT,
          type: payload.type,
          locationLat: payload.locationLat,
          locationLng: payload.locationLng,
        },
        include: {
          sender: true,
          help: {
            include: {
              requestedBy: true,
              helper: true,
            },
          },
        },
      });

      let sentTo = '';
      if (message.help.requestedById == payload.senderId)
        sentTo = message.help.helperId;
      else
        sentTo = message.help.requestedById;

      let userIds = [sentTo];
      const notificationPayload: NotificationPayloadDto = {
        userIds: userIds,
        type: NotificationType.HELP,
        title: 'Help Message',
        content: payload.message,
        data: payload.message,
      };
      this.pushNotificationService.notificationAliPush(notificationPayload);

      return message;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Help request not found');
        }
        throw new ForbiddenException(
          `Code: ${error.code}, Message: ${error.message}`,
        );
      }
      throw error;
    }
  }


  async deleteHelpMessage(messageId: string, userId: string) {
    const message = await this.prisma.helpMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Help message not found');
    }

    // Check if the logged-in user is the sender of this message
    if (message.senderId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this message',
      );
    }

    // You can either hard-delete or soft-delete
    // 🔥 Hard delete
    return this.prisma.helpMessage.delete({
      where: { id: messageId },
    });

    // ✅ If you prefer soft delete (recommended):
    // return this.prisma.helpMessage.update({
    //   where: { id: messageId },
    //   data: { isDeleted: true },
    // });
  }

}
