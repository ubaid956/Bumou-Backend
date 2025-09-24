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

interface HelpNotificationData {
  receiverId: string;
  message: string;
  title: string;
  data: any;
}

@Injectable()
export class HelpChatService {
  private recentMessages: Set<string> = new Set();

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotificationService: PushNotificationService
  ) {
    // Clean up recent messages every 30 seconds
    setInterval(() => {
      this.recentMessages.clear();
      console.log('🧹 Cleared recent messages cache');
    }, 30000);
  }

  async handleHelpNotification(notificationData: HelpNotificationData) {
    const callStack = new Error().stack;
    console.log('🚨 SENDING HELP NOTIFICATION - CALLED FROM:');
    console.log(callStack?.split('\n').slice(0, 5).join('\n'));
    console.log('📧 Notification to user:', notificationData.receiverId);
    console.log('📝 Message:', notificationData.message);
    console.log('🏷️ Title:', notificationData.title);

    const notificationPayload: NotificationPayloadDto = {
      userIds: [notificationData.receiverId],
      type: NotificationType.HELP,
      title: notificationData.title,
      content: notificationData.message,
      data: notificationData.data
    };

    console.log('📤 Sending push notification payload:', JSON.stringify(notificationPayload, null, 2));
    await this.pushNotificationService.sendPushNotification(notificationPayload);
    console.log('✅ Push notification sent successfully');
  }

  async handleNewHelpMessage(payload: any) {
    const callId = Date.now() + Math.random().toString(36).substr(2, 9);
    console.log('📨 HELP MESSAGE RECEIVED IN SERVICE - Call ID:', callId);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    // Create a unique message key for deduplication
    const messageKey = `${payload.helpId}-${payload.senderId}-${payload.message}-${Math.floor(Date.now() / 5000)}`;

    if (this.recentMessages.has(messageKey)) {
      console.log('🚫 DUPLICATE MESSAGE DETECTED - IGNORING');
      console.log('🔑 Message key:', messageKey);
      return null; // Return null for duplicate messages
    }

    // Add to recent messages cache
    this.recentMessages.add(messageKey);
    console.log('✅ Message marked as processed:', messageKey);

    const callStack = new Error().stack;
    console.log('🔍 CALLED FROM:');
    console.log(callStack?.split('\n').slice(0, 4).join('\n')); const shouldNotify = payload.shouldNotify !== false;  // Default to true
    try {
      console.log('💾 Creating message in database...');
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

      console.log('✅ Message created successfully:', message.id);
      console.log('👤 Sender:', message.sender.username);
      console.log('🆔 Help ID:', message.helpId);

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
