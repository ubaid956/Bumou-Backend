import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatMessageDto, CallDto } from '../dto';
import { MessageService } from '../service/message.service';
import { Prisma } from '@prisma/client';
import { HelpChatService } from '../service/help-chat.service';
import { NotificationPayloadDto, NotificationType } from 'src/aliyun-Notification/dto/notification-payload.dto';
import { PushNotificationService } from 'src/aliyun-Notification/push-notification.service';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  // Gateway-level deduplication to prevent duplicate WebSocket messages
  private recentMessages: Map<string, number> = new Map();
  private readonly GATEWAY_DEDUPE_TTL_MS = 3000; // 3 seconds

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private prisma: PrismaService,
    private helpChatService: HelpChatService, // private helpService: HelpService,
  ) { }

  private static connectionEvent: string = 'connection';
  private static chatEvent: string = 'chat';
  private static newMessageEvent: string = 'new-message';
  private static helpRequestEvent: string = 'help-request';
  private static helpRequestRemoveEvent: string = 'help-request-remove';
  private static helpMessageEvent: string = 'help-message';
  private static helpMessageDeletedEvent: string = 'help_message_deleted';
  private static commentNotificationEvent: string = 'comment-notification';

  async onModuleInit() {
    console.log('Socket server is running');
  }

  emitHelpRequest(payload: any) {
    this.server.emit(ChatGateway.helpRequestEvent, payload);
  }

  emitHelpRequestRemove(helpId: string) {
    this.server.emit(ChatGateway.helpRequestRemoveEvent, helpId);
  }

  emitHelpMessage(payload: any, userIds: string[]) {
    this.server
      .to(userIds)
      .emit(ChatGateway.helpMessageEvent, payload);
  }

  emitHelpMessageDeleted(messageId: string, helpId: string, deletedBy: string) {
    this.server.emit(ChatGateway.helpMessageDeletedEvent, {
      messageId,
      helpId,
      deletedBy
    });
  }

  emitCommentNotification(payload: any, userId: string) {
    this.server
      .to(userId)
      .emit(ChatGateway.commentNotificationEvent, payload);
  }

  emitMessageDeleted(messageId: string, chatroomId: string) {
    this.server.emit('message-deleted', { messageId, chatroomId });
  }

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.authService.verifyJwt(
        socket.handshake.headers.authorization,
      );
      const userId = decodedToken.sub;
      if (!userId) {
        throw new Error('Invalid User ID');
      }
      console.log('User: ' + userId + ' connected with ID: ' + socket.id);
      socket.join(userId);
      this.server
        .to(socket.id)
        .emit(ChatGateway.connectionEvent, { message: 'Connected' });
      this.addUserSession(socket.id, userId);

      console.log('Connected: ', socket.id);
    } catch (error) {
      console.log('Socket Connection Exception: ', error);
      this.server
        .to(socket.id)
        .emit(ChatGateway.connectionEvent, { error: error.message });
      socket.disconnect();
    }
  }

  @SubscribeMessage('delete-message')
  async handleDeleteMessage(client: Socket, data: { messageId: string }) {
    const { messageId } = data;
    const message = await this.messageService.deleteMessage(
      messageId,
      client.id,
    );
    if (message) {
      // Emit to the entire chatroom
      this.server.to(message.chatroomId).emit('delete-message', { messageId });
    }
  }

  async addUserSession(sessionId: string, userId: string) {
    try {
      await this.prisma.userSession.create({
        data: {
          id: sessionId.toString(),
          token: sessionId,
          userId,
        },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: { isOnline: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          console.log('User is already online');
          return;
        }
      }
    }
  }

  async deleteUserSession(sessionId: string) {
    const session = await this.prisma.userSession.findFirst({
      where: { token: sessionId },
    });
    if (!session) {
      return;
    }
    await this.prisma.userSession.delete({ where: { id: session.id } });
    this.prisma.userSession
      .aggregate({
        where: {
          userId: session.userId,
        },
        _count: true,
      })
      .then((count) => {
        if (count._count === 0) {
          this.prisma.user.update({
            where: { id: session.userId },
            data: { isOnline: false },
          });
        }
      });

    return session;
  }

  async handleDisconnect(client: Socket) {
    try {
      const session = await this.deleteUserSession(client.id);
      if (session) {
        console.log('User Left with ID: ', session.userId);
        client.leave(session.userId);
      }
      this.server.to(client.id).emit('You have been disconnected');
      console.log('Diconnected: ', client.id);
    } catch (error) {
      console.log('Socket Disconnection Exception: ', error);
    }
  }

  @SubscribeMessage(ChatGateway.newMessageEvent)
  async handleMessage(client: Socket, message: ChatMessageDto) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`🔥 [GATEWAY-REQ:${requestId}] NEW MESSAGE received from client ${client.id}`);
    console.log(`📦 [GATEWAY-REQ:${requestId}] Message:`, {
      senderId: message?.senderId,
      receiverId: message?.receiverId,
      message: message?.message?.substring(0, 50) + '...',
      chatroomId: message?.chatroomId,
      type: message?.type
    });

    if (!message) {
      console.log(`❌ [GATEWAY-REQ:${requestId}] Empty message received`);
      return;
    }

    // Gateway-level deduplication to prevent duplicate WebSocket messages
    const messageKey = `${message.senderId}:${message.receiverId}:${message.message}:${message.type}`;
    const now = Date.now();

    // Clean up old entries
    for (const [key, timestamp] of this.recentMessages) {
      if (now - timestamp > this.GATEWAY_DEDUPE_TTL_MS) {
        this.recentMessages.delete(key);
      }
    }

    // Check if this is a duplicate message
    if (this.recentMessages.has(messageKey)) {
      const lastReceived = this.recentMessages.get(messageKey) || 0;
      if (now - lastReceived <= this.GATEWAY_DEDUPE_TTL_MS) {
        console.log(`🚫 [GATEWAY-REQ:${requestId}] DUPLICATE MESSAGE BLOCKED at gateway level: ${messageKey}`);
        // Still send acknowledgment to client but don't process
        client.emit('acknowledge', { success: true });
        return;
      }
    }

    // Record this message to prevent future duplicates
    this.recentMessages.set(messageKey, now);

    const success = true;
    client.emit('acknowledge', { success });

    console.log(`🔄 [GATEWAY-REQ:${requestId}] Calling messageService.onNewMessage`);
    const response = await this.messageService.onNewMessage(message);

    this.server
      .to([message.senderId, message.receiverId])
      .emit(ChatGateway.chatEvent, response);

    console.log(`✅ [GATEWAY-REQ:${requestId}] Message handling completed`);
  } @SubscribeMessage(ChatGateway.helpMessageEvent)
  async handleHelpMessage(client: Socket, payload: any) {
    console.log('🔥 HELP MESSAGE HANDLER CALLED - handleHelpMessage');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    try {
      if (
        !payload ||
        !payload.message ||
        !payload.senderId ||
        !payload.helpId
      ) {
        console.log('❌ Invalid help message payload: ', payload);
        return;
      }
      const success = true;
      client.emit('acknowledge', { success });

      console.log('📨 Processing help message...');
      const response = await this.helpChatService.handleNewHelpMessage(payload);

      // Check if message was a duplicate and ignored
      if (!response) {
        console.log('🚫 Duplicate message ignored - skipping notification and socket emit');
        return;
      }

      const senderId = response.help.helper.id;
      const receiverId = response.help.requestedBy.id;

      // Send notification to the recipient only (not the sender)
      const notificationReceiverId = payload.senderId === receiverId ? senderId : receiverId;

      console.log('🔔 Sending notification to user:', notificationReceiverId);
      console.log('📤 Sender:', payload.senderId, 'Receiver:', notificationReceiverId);

      // Pass the notification data to helpChatService
      await this.helpChatService.handleHelpNotification({
        receiverId: notificationReceiverId,
        message: response.message,
        title: response.sender?.username || 'Help Message',
        data: response
      });

      // Emit real-time socket event for both users
      console.log('📡 Emitting socket event to users:', [senderId, receiverId]);
      this.emitHelpMessage(response, [senderId, receiverId]);

      console.log('✅ Help message processed successfully');
    } catch (error) {
      console.log('❌ Error handling help message: ', error);
    }
  }

  @SubscribeMessage(ChatGateway.helpRequestEvent)
  async handleHelpRequestEvent(client: Socket, @MessageBody() payload: any) { }



  // //! Calling Events //TODO: Move to a separate gateway
  @SubscribeMessage('newCall')
  async handleMakeCall(client: Socket, @MessageBody() data: CallDto) {
    try {
      console.log("calling");
      console.log(data);
      this.validateCallPayload(data);

      const callId = this.generateCallId(data.senderId, data.receiverId);

      this.server.to(data.receiverId).emit('newCall', data);
    } catch (error) {
      console.log("error");
    }
  }

  @SubscribeMessage('answerCall')
  async handleAnswerCall(client: Socket, @MessageBody() data: CallDto) {
    try {
      this.validateCallPayload(data);

      const callId = this.generateCallId(data.senderId, data.receiverId);

      this.server.to(data.receiverId).emit('answerCall', data);
    } catch (error) { }
  }

  @SubscribeMessage('endCall')
  async handleEndCall(client: Socket, @MessageBody() data: CallDto) {
    try {
      this.validateCallPayload(data);

      const callId = this.generateCallId(data.senderId, data.receiverId);

      this.server.to(data.receiverId).emit('endCall', data);
    } catch (error) { }
  }

  @SubscribeMessage('signal')
  handleIceCandidate(client: Socket, @MessageBody() data: CallDto) {
    try {
      this.validateCallPayload(data);

      this.server.to(data.receiverId).emit('signal', data);
    } catch (error) { }
  }

  private generateCallId(callerId: string, receiverId: string) {
    const ids = [callerId, receiverId];
    ids.sort();
    return ids.join('_');
  }

  private validateCallPayload(data: CallDto) {
    if (
      !data ||
      !data.senderId ||
      !data.receiverId ||
      !data.payload ||
      !data.type
    ) {
      return data;
    } else {
      throw new Error('Invalid Call Payload');
    }
  }
}
