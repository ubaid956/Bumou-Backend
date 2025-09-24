import { ForbiddenException, Injectable } from '@nestjs/common';
import { ChatroomMessageType } from '@prisma/client';
import { I18nContext, logger } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
// import { PushNotificationService } from 'src/push-notification/push-notification.service';

import { PushNotificationService } from 'src/aliyun-Notification/push-notification.service';
import { ChatMessageDto } from '../dto';


@Injectable()
export class MessageService {
  i18n: any;
  constructor(
    private prisma: PrismaService,
    private readonly pushNotificationService: PushNotificationService
  ) { }

  async onNewMessage(message: ChatMessageDto) {
    const requestId = Math.random().toString(36).substring(7);
    const serverTime = new Date();
    logger.log(`🔥 [MSG-SVC-REQ:${requestId}] onNewMessage called at ${serverTime.toISOString()}`);
    logger.log(`📦 [MSG-SVC-REQ:${requestId}] Message details:`, {
      senderId: message?.senderId,
      receiverId: message?.receiverId,
      message: message?.message?.substring(0, 50) + '...',
      chatroomId: message?.chatroomId,
      type: message?.type
    });

    let chatroomId = message.chatroomId;
    if (!chatroomId) {
      chatroomId = [message.receiverId, message.senderId].sort().join('_');
    }
    let chatroom: any = await this.getChatRoomById(
      chatroomId,
      message.senderId,
    );

    let lastMessage: string = message.message;

    if (message.type == ChatroomMessageType.TEXT) {
      lastMessage = message.message;
    } else {
      lastMessage = `*${message.type}*`;
    }

    if (!chatroom) {
      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              user1Id: message.senderId,
              user2Id: message.receiverId,
            },
            {
              user1Id: message.receiverId,
              user2Id: message.senderId,
            },
          ],
        },
      });
      if (!friendship) {
        return {
          message: "Friendship not found",
        };
        //throw new ForbiddenException("Friendship not found");
      }
      chatroom = await this.prisma.chatroom.create({
        data: {
          id: chatroomId,
          lastMessage: lastMessage,
          name: 'Private',
          members: {
            connect: [{ id: message.senderId }, { id: message.receiverId }],
          },
          messages: {
            create: {
              message: message.message,
              type: message.type,
              status: message.status,
              senderId: message.senderId,
              file: message.file,
              reply_id: message.reply_id,
              readBy: {
                create: {
                  userId: message.senderId,
                  chatroomId: message.chatroomId,
                },
              },
            },
          },
        },
        include: {
          members: true,
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            include: {
              readBy: {
                where: {
                  userId: message.senderId,
                },
              },
            },
          },
        },
      });

      chatroom = { ...chatroom, unreadCount: 1 };
    } else {
      chatroom = await this.prisma.chatroom.update({
        where: {
          id: chatroomId,
        },
        data: {
          lastMessage: lastMessage,
          messages: {
            create: {
              message: message.message,
              type: message.type,
              status: message.status,
              senderId: message.senderId,
              file: message.file,
              reply_id: message.reply_id,
              readBy: {
                create: {
                  userId: message.senderId,
                  chatroomId: message.chatroomId,
                },
              },
            },
          },
        },
        include: {
          members: true,
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            include: {
              readBy: {
                where: {
                  userId: message.senderId,
                },
              },
            },
          },
        },
      });

      /// Refresh User
      chatroom = await this.prisma.chatroom.findUnique({
        where: { id: chatroomId },
        include: {
          members: true,
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            include: {
              readBy: {
                where: {
                  userId: message.senderId,
                },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  readBy: {
                    none: {
                      userId: message.receiverId,
                    },
                  },
                },
              },
            },
          },
        },
      });

      chatroom = { ...chatroom, unreadCount: chatroom._count?.messages };
    }

    this.pushNotificationService.sendMessageNotification(message);

    logger.log(`✅ [MSG-SVC-REQ:${requestId}] onNewMessage completed, calling push notification`);
    logger.log(`📅 [MSG-SVC-REQ:${requestId}] Final message timestamp: ${chatroom.messages[0]?.createdAt?.toISOString()}`);
    logger.debug('CHATROOM ' + chatroom);

    return {
      chatroom: chatroom,
      message: chatroom.messages[0],
    };
  }
  async getMessages(
    chatroomId: string,
    userId: string,
    page: number,
    pageSize: number,
  ) {
    // Validate pagination parameters
    page = Math.max(1, page); // Ensure page is at least 1
    pageSize = Math.max(1, Math.min(100, pageSize)); // Ensure pageSize is between 1 and 100

    logger.debug(`Getting messages for chatroom: ${chatroomId}, user: ${userId}, page: ${page}, pageSize: ${pageSize}`);

    let all_messages: any = await this.prisma.chatroomMessage.findMany({
      where: {
        chatroomId: chatroomId,
        readBy: {
          none: {
            userId: userId,
          },
        },
      },
      include: {
        readBy: {
          where: {
          },
        },
      },

    });

    all_messages.map((message_one) => {
      // logger.debug('Message 0 :: ' + message_one.message);
      // logger.debug('Message 1 :: ' + message_one.isDeleted);
      // logger.debug('Message 2 :: ' + message_one.readBy);
      // logger.debug('Message 3 :: ' + message_one.senderId);
      // message_one.readBy.map((read_by) => {
      //    logger.debug('Message read :: ' + read_by.userId);
      // })
      if (message_one.readBy == null) {
        logger.debug('Message 4 :: ' + message_one.id);
        this.prisma.chatroomMessage.delete({
          where: { id: message_one.id },
        }).then(function (result) {
          console.log(result);
        })
          .catch(function (error) {
            console.error(error)
          });

      } else {
        this.prisma.chatroomReadStatus.create({
          data: {
            userId: userId,
            messageId: message_one.id,
            chatroomId: chatroomId,
          },
        });
      }

    });


    return await this.prisma.chatroomMessage.findMany({
      where: {
        chatroomId: chatroomId,
        isDeleted: false, // Ensure only non-deleted messages are fetched
      },
      include: {
        readBy: {
          where: { userId: userId },
        },
        reply: true,
      },
      skip: (page - 1) * pageSize, // Fixed pagination formula
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatroomMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new ForbiddenException('Message not found');
    }

    // Optionally, you might want to check if the user is authorized to delete this message.
    if (message.senderId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this message',
      );
    }

    // Update the message to mark it as deleted
    return this.prisma.chatroomMessage.delete({
      where: { id: messageId },
    });
  }

  async deleteChatRoom(chatroomId: string) {
    const chartRoom = await this.prisma.chatroom.findUnique({
      where: { id: chatroomId },
    });
    if (!chartRoom) {
      throw new ForbiddenException(
        this.i18n.translate('t.chatroom_not_found_with_the_given_id', {
          lang: I18nContext.current().lang,
        }) + chatroomId,
      );
    }

    const chatRoomReadStatus = this.prisma.chatroomReadStatus.deleteMany({
      where: { chatroom: chartRoom },
    });
    const deleteChatRoom = this.prisma.chatroom.delete({
      where: { id: chatroomId },
    });

    return this.prisma.$transaction([chatRoomReadStatus, deleteChatRoom]);
  }

  async getChatRoomsByUser(userId: string, page: number, pageSize: number) {
    // Validate pagination parameters
    page = Math.max(1, page); // Ensure page is at least 1
    pageSize = Math.max(1, Math.min(100, pageSize)); // Ensure pageSize is between 1 and 100

    console.log("fetching getChatRoomsByUser");
    logger.debug('Fetching chatroom for ::  ' + userId);
    logger.debug(`Pagination: page=${page}, pageSize=${pageSize}, skip=${(page - 1) * pageSize}`);

    const chatRooms = await this.prisma.chatroom.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
      skip: (page - 1) * pageSize, // Corrected pagination formula
      take: pageSize,
      orderBy: {
        updatedAt: 'desc',
      },
      // Include 'members' except the current user
      include: {
        members: {
          where: {
            id: {
              not: userId,
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            readBy: {
              where: {
                userId,
              },
            },
          },
        },
        // Include the count of messages that have not been read by the current user
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
    });

    // Map the results to include the unread count and remove the `_count` wrapping
    const chatroomWithUnreadCount = chatRooms.map((chatroom) => {
      logger.debug('CHATROOM UNREAD COUNT :: ' + chatroom._count?.messages);
      // chatroom.messages.map((message_one) => {
      //   logger.debug('CHATROOM message :: ' + message_one.message);
      //    message_one.readBy.map((read_by) => {
      //     logger.debug('message read:: ' + read_by.userId);
      //    })
      // })
      return {
        ...chatroom,
        unreadCount: chatroom._count?.messages,
      };
    });
    return chatroomWithUnreadCount;
  }

  async getChatRoomById(chatroomId: string, userId: string) {
    console.log("faching getChatRoomById");
    return this.prisma.chatroom.findUnique({
      where: { id: chatroomId },
      include: {
        members: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                readBy: {
                  none: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
