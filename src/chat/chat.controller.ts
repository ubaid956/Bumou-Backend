import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
  Optional,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/decorator';
import { ChatService } from './service/chat.service';
import { MessageService } from './service/message.service';

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private messageService: MessageService,
    private readonly chatService: ChatService,
  ) {}

  @Get('chatrooms')
  async getChatRooms(
    @GetUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) || 1 : 1;
    const pageSizeNumber = pageSize ? parseInt(pageSize, 10) || 20 : 20;
    return this.messageService.getChatRoomsByUser(userId, pageNumber, pageSizeNumber);
  }

  @Delete('messages/:messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @GetUser('id') userId: string,
  ) {
    return this.messageService.deleteMessage(messageId, userId);
  }

  @Delete('chatrooms/:chatroomId')
  async deleteChatRoom(@Param('chatroomId') chatroomId: string) {
    return this.messageService.deleteChatRoom(chatroomId);
  }

  @Get('messages/:chatroomId')
  async getMessages(
    @Param('chatroomId') chatroomId: string,
    @GetUser('id') userId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 20,
  ) {
    return this.messageService.getMessages(chatroomId, userId, page, pageSize);
  }

  @Put('mark-read/:chatroomId/:messageId')
  async markMessageAsRead(
    @GetUser('id') userId: string,
    @Param('messageId') messageId: string,
    @Param('chatroomId') chatroomId: string,
  ) {
    return this.chatService.markMessageAsRead(userId, messageId, chatroomId);
  }
}
