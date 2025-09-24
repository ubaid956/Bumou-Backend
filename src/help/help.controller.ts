import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HelpService } from './help.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/decorator';
import { NewHelpDto } from './dto';
import { HelpMessageRequestDto } from './dto/accept-help.dto';

@Controller('help')
export class HelpController {
  constructor(private readonly service: HelpService) { }

  @UseGuards(JwtGuard)
  @Post('ask')
  async askForHelp(@GetUser('id') id: string, @Body() payload: NewHelpDto) {
    return await this.service.askForHelp(id, payload);
  }

  @UseGuards(JwtGuard)
  @Put('accept/:id')
  async acceptHelp(@GetUser('id') userId: string, @Param('id') helpId: string) {
    return await this.service.acceptHelp(userId, helpId);
  }

  @UseGuards(JwtGuard)
  @Delete('delete/:id')
  async deleteHelp(@Param('id') helpId: string) {
    return await this.service.deleteHelp(helpId);
  }

  @UseGuards(JwtGuard)
  @Put('cancel/:id')
  async cancelHelp(@Param('id') helpId: string) {
    return await this.service.cancelHelp(helpId);
  }

  @UseGuards(JwtGuard)
  @Get('my-pending')
  async getMyPendingHelpRequests(@GetUser('id') id: string) {
    return await this.service.getMyPendingHelpRequests(id);
  }

  @UseGuards(JwtGuard)
  @Get('ongoing')
  async getOngoingHelp(@GetUser('id') id: string) {
    return await this.service.getOngoingHelp(id);
  }

  @UseGuards(JwtGuard)
  @Get('incoming-requests')
  async getIncomingRequests(@GetUser('id') id: string) {
    return await this.service.getIncomingRequests(id);
  }

  @UseGuards(JwtGuard)
  @Get('messages/:id')
  async getHelpMessages(
    @GetUser('id') userId: string,
    @Param('id') helpId: string,
  ) {
    return await this.service.getHelpMessages(userId, helpId);
  }

  // Mark a specific help message as read by current user
  @UseGuards(JwtGuard)
  @Post('messages/:messageId/mark-read')
  async markHelpMessageAsRead(
    @GetUser('id') userId: string,
    @Param('messageId') messageId: string,
  ) {
    return await this.service.markHelpMessageAsRead(userId, messageId);
  }

  @UseGuards(JwtGuard)
  @Delete('help_messages/delete/:id')
  async deleteHelpMessages(
    @Param('id') messageId: string,
    @GetUser('id') userId: string,
    @GetUser() user: any,
  ) {
    console.log('Controller deleteHelpMessages:', {
      messageId,
      userId,
      userType: typeof userId,
      userObject: user,
      userObjectId: user?.id,
      userObjectIdType: typeof user?.id
    });
    return await this.service.deleteHelpMessages(messageId, userId);
  }

  @UseGuards(JwtGuard)
  @Put('mark-read/:chatroomId/:messageId')
  async markMessageAsRead(
    @GetUser('id') userId: string,
    @Param('messageId') messageId: string,
    @Param('chatroomId') chatroomId: string,
  ) {
    return this.service.markMessageAsRead(userId, messageId, chatroomId);
  }
}
