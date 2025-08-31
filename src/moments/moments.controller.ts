import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/decorator';
import { PaginationRequest } from 'src/utils';
import { AddCommentDto, AddReplyDto, CreatePostDto } from './dto';
import { MomentsService } from './moments.service';

@UseGuards(JwtGuard)
@Controller('moments')
export class MomentsController {
  constructor(private momentService: MomentsService) {}

  @Get('my')
  async getMyPosts(
    @GetUser('id') currentUserId: string,
    @Query() query: PaginationRequest,
  ) {
    return await this.momentService.getMyPosts(currentUserId, query);
  }

  @Get('user/:id')
  async getUserPosts(
    @GetUser('id') currentUserId: string,
    @Param('id') userId: string,
    @Query() query: PaginationRequest,
  ) {
    return await this.momentService.getUserPosts(currentUserId, userId, query);
  }

  @HttpCode(HttpStatus.OK)
  @Post()
  async createPost(@GetUser('id') userId: string, @Body() body: CreatePostDto) {
    return this.momentService.createPost(userId, body);
  }

  @Get()
  async getPosts(
    @GetUser('id') userId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 20,

    @Query('isAnonymous') isAnonymous: boolean = false,
  ) {
    return this.momentService.getPosts(userId, page, pageSize, isAnonymous);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':postId/comment')
  async addComment(
    @GetUser('id') userId: string,
    @Param('postId') postId: string,
    @Body() body: AddCommentDto,
  ) {
    return this.momentService.addComment(userId, postId, body);
  }

  @Get(':postId/comments')
  async getComments(
    @Param('postId') postId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 20,
  ) {
    return this.momentService.getComments(postId, page, pageSize);
  }

  /**
   * Add a reply to an existing comment
   * @param userId Current user's ID
   * @param postId ID of the post that contains the comment
   * @param commentId ID of the comment being replied to
   * @param body Reply content
   * @returns Created reply
   */
  @HttpCode(HttpStatus.OK)
  @Post(':postId/comment/:commentId/reply')
  async addReply(
    @GetUser('id') userId: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() body: AddReplyDto,
  ) {
    return this.momentService.addReply(userId, postId, commentId, body);
  }

  @Delete(':postId/comment/:commentId')
  async deleteComment(
    @GetUser('id') userId: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.momentService.deleteComment(userId, postId, commentId);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':postId/like')
  async likePost(
    @GetUser('id') userId: string,
    @Param('postId') postId: string,
  ) {
    return this.momentService.likePost(userId, postId);
  }

  @Get(':postId/likes')
  async getLikes(
    @Param('postId') postId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 20,
  ) {
    return this.momentService.getLikes(postId, page, pageSize);
  }

  @Delete(':postId')
  async deletePost(
    @GetUser('id') userId: string,
    @Param('postId') postId: string,
  ) {
    return this.momentService.deletePost(userId, postId);
  }

  /**
   * Get count of unread comments and likes on moments
   * @param userId Current user ID
   * @returns Object with unread counts
   */
  @Get('unread-count')
  async getUnreadCount(@GetUser('id') userId: string) {
    return this.momentService.getUnreadCount(userId);
  }

  /**
   * Mark a post as viewed by the current user
   * @param userId Current user ID
   * @param postId ID of the post being viewed
   * @returns Success status
   */
  @Post(':postId/view')
  async markPostAsViewed(
    @GetUser('id') userId: string,
    @Param('postId') postId: string,
  ) {
    return this.momentService.markPostAsViewed(userId, postId);
  }
}
