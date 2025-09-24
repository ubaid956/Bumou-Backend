import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewHelpDto } from './dto';
// import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { PushNotificationService } from 'src/aliyun-Notification/push-notification.service';
import {

  NotificationPayloadDto,
  NotificationType,
} from 'src/aliyun-Notification/dto/notification-payload.dto';
import { ChatroomMessageType, HelpStatus, Prisma } from '@prisma/client';
import { HelpMessageRequestDto } from './dto/accept-help.dto';
import { ChatGateway } from 'src/chat/gateway/chat.gateway';
import { HelpChatService } from 'src/chat/service/help-chat.service';

@Injectable()
export class HelpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: PushNotificationService,
    private readonly chatGateway: ChatGateway,
    private readonly helpChatService: HelpChatService,
  ) { }

  static expiresIn = 2 * 60 * 60 * 1000;

  async getMyPendingHelpRequests(userId: string) {
    const helps = await this.prisma.help.findMany({
      where: {
        requestedById: userId,
        status: HelpStatus.PENDING,
        createdAt: {
          gte: new Date(new Date().getTime() - HelpService.expiresIn),
        },
      },
      include: {
        requestedBy: true,
        helper: true,
        messages: {
          include: { sender: true },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      take: 1,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return helps.length > 0 ? helps[0] : null;
  }

  async getOngoingHelp(userId: string) {
    const myHelp = await this.prisma.help.findMany({
      where: {
        OR: [
          {
            requestedById: userId,
          },
          {
            helperId: userId,
          },
        ],
        status: {
          in: [HelpStatus.ACCEPTED],
        },
      },
      include: {
        requestedBy: true,
        helper: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                readBy: {
                  none: {
                    userId: userId,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // Map the results to include the unread count and remove the `_count` wrapping
    const chatroomWithUnreadCount = myHelp.map((chatroom) => {

      return {
        ...chatroom,
        unreadCount: chatroom._count?.messages,
      };
    });
    return chatroomWithUnreadCount;

    // return myHelp;
  }

  async getIncomingRequests(userId: string) {
    // current time
    const currentTime = new Date();
    const help = await this.prisma.help.findMany({
      where: {
        requestedById: {
          not: userId,
        },
        status: HelpStatus.PENDING,
        createdAt: {
          gte: new Date(currentTime.getTime() - HelpService.expiresIn),
        },
      },
      include: {
        requestedBy: true,
        helper: true,
        messages: {
          include: { sender: true },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      take: 50,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return help;
  }

  async askForHelp(id: string, payload: NewHelpDto) {
    console.log('payload', payload);

    const help = await this.prisma.help.create({
      data: {
        messages: {
          create: {
            message: payload.message,
            type: ChatroomMessageType.TEXT,
            sender: {
              connect: {
                id,
              },
            },
          },
        },
        requestedBy: {
          connect: {
            id,
          },
        },
      },
      include: {
        requestedBy: true,
        messages: {
          include: { sender: true },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const userIds = await this.prisma.user.findMany({
      where: {
        isHelping: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 500,
      select: {
        id: true,
      },
    });

    let enHelpMessage = payload.message;
    let zhHelpMessage = payload.message;
    if (!enHelpMessage) {
      enHelpMessage = 'Someone needs help!';
      zhHelpMessage = '有人需要帮助！';
    }

    const notificationPayload: any = {
      enHelpMessage,
      zhHelpMessage,
      ...help,
    };

    await this.notification.sendHelpNotification(
      notificationPayload,
      userIds.map((user) => user.id),
    );

    this.chatGateway.emitHelpRequest(help);

    return help;
  }

  async cancelHelp(id: string) {
    try {
      const help = await this.prisma.help.delete({
        where: {
          id,
          status: HelpStatus.PENDING,
        },
        include: {
          requestedBy: true,
          helper: true,
          messages: {
            include: { sender: true },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });

      this.chatGateway.emitHelpRequestRemove(id);
      return {
        success: true,
        message: 'Help request cancelled',
        help,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('找不到帮助请求');
        }
        throw new ForbiddenException(
          `Code: ${error.code}, Message: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async acceptHelp(userId: string, helpId: string) {
    try {
      const help = await this.prisma.help.update({
        where: {
          id: helpId,
          status: HelpStatus.PENDING,
        },
        data: {
          status: HelpStatus.ACCEPTED,
          helper: {
            connect: {
              id: userId,
            },
          },
        },
      });

      this.chatGateway.emitHelpRequestRemove(helpId);

      const notificationPayload: NotificationPayloadDto = {
        userIds: [help.requestedById],
        type: NotificationType.HELP,
        title: "Help Request Accepted",
        content: '您的帮助请求已被接受',
        data: {
          type: NotificationType.HELP,
          message: '您的帮助请求已被接受',
          help,
        },
      };
      // this.notification.sendPushNotification(notificationPayload);
      this.notification.sendPushNotification(notificationPayload);

      const message = await this.helpChatService.handleNewHelpMessage({
        message: '来这里帮忙！',
        helpId: helpId,
        senderId: userId,
        type: ChatroomMessageType.JOIN,
      });

      this.chatGateway.emitHelpMessage(message, [help.requestedById, userId]);

      return help;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('找不到帮助请求');
        }
        throw new ForbiddenException(
          `Code: ${error.code}, 信息: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async deleteHelp(helpId: string) {
    return this.prisma.help.delete({ where: { id: helpId } });
  }

  async deleteHelpMessages(messageId: string, userId: string) {
    const message = await this.prisma.helpMessage.findUnique({
      where: { id: messageId },
      include: {
        help: {
          include: {
            requestedBy: true,
            helper: true,
          },
        },
      },
    });

    if (!message) {
      throw new ForbiddenException('Message not found');
    }

    // Debug logging
    console.log('Delete message debug:', {
      messageId,
      userId,
      userIdType: typeof userId,
      senderId: message.senderId,
      senderIdType: typeof message.senderId,
      requestedById: message.help.requestedById,
      helperId: message.help.helperId,
      isSender: message.senderId === userId,
      isRequestedBy: message.help.requestedById === userId,
      isHelper: message.help.helperId === userId,
      stringComparison: {
        senderIdEqualsUserId: message.senderId === userId,
        requestedByIdEqualsUserId: message.help.requestedById === userId,
        helperIdEqualsUserId: message.help.helperId === userId,
      },
      messageObject: message,
    });

    // Allow deletion if user is the sender OR is part of the help conversation
    const canDelete = message.senderId === userId ||
      message.help.requestedById === userId ||
      message.help.helperId === userId;

    if (!canDelete) {
      throw new ForbiddenException(
        'You do not have permission to delete this message',
      );
    }

    const deletedMessage = await this.prisma.helpMessage.delete({
      where: { id: messageId }
    });

    // Emit socket event for real-time deletion
    const userIds = [];
    if (message.help.requestedById) {
      userIds.push(message.help.requestedById);
    }
    if (message.help.helperId) {
      userIds.push(message.help.helperId);
    }

    this.chatGateway.emitHelpMessageDeleted(messageId, message.helpId, userId);

    return deletedMessage;
  }

  async getHelpMessages(userId: string, helpId: string) {
    const helpMessages: any = await this.prisma.helpMessage.findMany({
      where: {
        helpId,
      },
      include: {
        sender: true,
        readBy: true,
      },
      take: 100,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return helpMessages;
  }

  async markHelpMessageAsRead(userId: string, messageId: string) {
    // Ensure message exists and fetch its helpId
    const msg = await this.prisma.helpMessage.findUnique({
      where: { id: messageId },
      select: { id: true, helpId: true, senderId: true },
    });
    if (!msg) throw new NotFoundException('Help message not found');

    // Do not create read status if user is the sender (already read by definition)
    if (msg.senderId === userId) {
      return { success: true };
    }

    // Upsert a HelpReadStatus record for this user/message
    await this.prisma.helpReadStatus.upsert({
      where: {
        helpMessageId_helpId_userId: {
          helpMessageId: messageId,
          helpId: msg.helpId,
          userId,
        },
      },
      create: {
        helpId: msg.helpId,
        helpMessageId: messageId,
        userId,
      },
      update: {},
    });

    return { success: true };
  }

  async markMessageAsRead(
    userId: string,
    helpMessageId: string,
    helpId: string,
  ) {


    let existingStatus = await this.prisma.helpReadStatus.findFirst({
      where: {
        userId,
        helpMessageId,
        helpId,
      },
    });
    if (existingStatus) {
      return existingStatus;
    }
    existingStatus = await this.prisma.helpReadStatus.create({
      data: {
        userId,
        helpMessageId,
        helpId,
      },
    });

    return existingStatus;
  }

  // async completeHelp(helpId: string) {
  //   throw new Error('Method not implemented.');
  // }

  // async getOngoingHelp(id: string) {
  //   const help = await this.prisma.help.findFirst({
  //     where: {
  //       OR: [
  //         {
  //           requestedById: id,
  //         },
  //         {
  //           helperId: id,
  //         },
  //       ],
  //       status: {
  //         in: [HelpStatus.PENDING, HelpStatus.ACCEPTED],
  //       },
  //     },
  //     include: {
  //       requestedBy: true,
  //       helper: true,
  //       messages: {
  //         orderBy: {
  //           createdAt: 'desc',
  //         },
  //         take: 50,
  //       },
  //     },
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //   });
  //   if (!help) {
  //     return new NotFoundException('No ongoing help found');
  //   }
  //   return help;
  // }

  // async addNewHelpMessage(payload: HelpMessageRequestDto) {
  //   try {
  //     const help = await this.prisma.help.findUnique({
  //       where: {
  //         id: payload.helpId,
  //       },
  //     });
  //     if (!help) {
  //       return;
  //     }
  //     const message = await this.prisma.helpMessage.create({
  //       data: {
  //         message: payload.message,
  //         sender: {
  //           connect: {
  //             id: payload.senderId,
  //           },
  //         },
  //         help: {
  //           connect: {
  //             id: help.id,
  //           },
  //         },
  //       },
  //     });
  //     let userIds = [help.requestedById];
  //     if (help.helperId) {
  //       userIds.push(help.helperId);
  //     }

  //     this.chatGateway.emitHelpMessage(
  //       {
  //         type: NotificationType.HELP,
  //         message,
  //         help,
  //       },
  //       userIds,
  //     );

  //     // remove userid of sender
  //     userIds = userIds.filter((id) => id !== payload.senderId);

  //     const notificationPayload: NotificationPayloadDto = {
  //       userIds: userIds,
  //       type: NotificationType.HELP,
  //       content: payload.message,
  //       data: {
  //         type: NotificationType.HELP,
  //         message,
  //         help,
  //       },
  //     };

  //     this.notification.sendPushNotification(notificationPayload);

  //     return {
  //       help,
  //       message,
  //     };
  //   } catch (error) {}
  // }
}
