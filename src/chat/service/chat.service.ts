import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async markMessageAsRead(
    userId: string,
    messageId: string,
    chatroomId: string,
  ) {
    // First check if the message exists
    const message = await this.prisma.chatroomMessage.findUnique({
      where: {
        id: messageId,
        chatroomId: chatroomId,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found in the specified chatroom');
    }

    let existingStatus = await this.prisma.chatroomReadStatus.findFirst({
      where: {
        userId,
        messageId,
        chatroomId,
      },
    });

    if (existingStatus) {
      throw new ForbiddenException('Message already read');
    }
    existingStatus = await this.prisma.chatroomReadStatus.create({
      data: {
        userId,
        messageId,
        chatroomId,
      },
    });

    return existingStatus;
  }
}
