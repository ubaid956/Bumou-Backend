import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationRequest } from 'src/utils';
import { AddCommentDto, CreatePostDto, AddReplyDto } from './dto';
// import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { PushNotificationService } from 'src/aliyun-Notification/push-notification.service';
// import { PushNotificationCommentService } from 'src/push-notification/push-notification-comment.service';
import { PushNotificationCommentService } from 'src/aliyun-Notification/push-notification-comment.service';
import { NotificationType } from 'src/aliyun-Notification/dto/notification-payload.dto';

@Injectable()
export class MomentsService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly pushNotificationCommentService: PushNotificationCommentService,
  ) { }

  async getUserPosts(
    currentUserId: string,
    userId: string,
    query: PaginationRequest,
  ) {
    let { page, size } = query;
    if (page < 1) {
      page = 1;
    }
    const skip = (page - 1) * size;

    const posts = await this.prisma.post.findMany({
      where: {
        userId,
        is_anonymous: false,
      },
      take: size,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        mediaAttachments: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            userType: true,
          },
        },
        comments: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                userType: true,
              },
            },
          },
        },
        likes: {
          where: {
            userId: currentUserId,
          },
        },
      },
    });

    const postsWithExtras = posts.map((post) => {
      const numberOfLikes = post.total_likes;

      return {
        ...post,
        numberOfLikes,
        isLikeByMe: post.likes.length > 0,
      };
    });

    return postsWithExtras;
  }

  async getMyPosts(userId: string, query: PaginationRequest) {
    let { page, size } = query;
    if (page < 1) {
      page = 1;
    }
    const skip = (page - 1) * size;

    const posts = await this.prisma.post.findMany({
      where: {
        userId,
      },
      take: size,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        mediaAttachments: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            userType: true,
          },
        },
        comments: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                userType: true,
              },
            },
          },
        },
        likes: {
          where: {
            userId,
          },
        },
      },
    });

    const postsWithExtras = posts.map((post) => {
      const numberOfLikes = post.total_likes;

      return {
        ...post,
        numberOfLikes,
        isLikeByMe: post.likes.length > 0,
      };
    });

    return postsWithExtras;
  }

  async createPost(userId: string, body: CreatePostDto) {
    if (!body || (body.mediaAttachments == null && body.text == null)) {
      throw new ForbiddenException(
        this.i18n.translate('t.please_attach_some_data_text_image_or_video', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const post = await this.prisma.post.create({
      data: {
        text: body.text,
        userId: userId,
        is_anonymous: body.isAnonymous,
        mediaAttachments: {
          create: body.mediaAttachments,
        },
      },
    });
    return post;
  }

  async getPosts(
    userId: string,
    page: number,
    pageSize: number,
    isAnonymous: boolean = false,
  ) {
    try {
      if (page === 0) {
        throw new ForbiddenException(
          this.i18n.translate('t.page_must_be_greater_than_0', {
            lang: I18nContext.current().lang,
          }),
        );
      }
      const skip = (page - 1) * pageSize;
      const posts = await this.prisma.post.findMany({
        where: {
          OR: [
            { userId },
            {
              user: {
                OR: [
                  {
                    friends1: {
                      some: {
                        user2Id: userId,
                        status: 'ACCEPTED',
                      },
                    },
                  },
                  {
                    friends2: {
                      some: {
                        user1Id: userId,
                        status: 'ACCEPTED',
                      },
                    },
                  },
                ],
              },
            },
            isAnonymous ? { is_anonymous: true } : {},
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          mediaAttachments: true,
          user: {
            // Include user details for post owner
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              userType: true,
            },
          },
          comments: {
            take: 3, // Include the first 3 comments
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                  userType: true,
                },
              },
            },
          },
          likes: {
            where: {
              userId,
            },
          },
        },
      });

      const ananymousUser: User = await this.prisma.user.findFirst({
        where: {
          id: 'anonymous',
        },
      });

      // Calculate the number of likes and set the isLikeByMe flag
      const postsWithExtras = posts.map((post) => {
        const numberOfLikes = post.total_likes;

        if (post.is_anonymous) {
          post.user = ananymousUser;
        }

        // Process comments to clean up reply metadata
        const processedComments = post.comments.map(comment => {
          // Check if this comment is a reply (has metadata)
          const replyMatch = comment.text.match(/^\[REPLY:([^\]]+)\]\s+(.*)/);

          if (replyMatch) {
            // Extract the parent comment ID and the actual comment text
            const parentCommentId = replyMatch[1];
            const actualText = replyMatch[2];

            return {
              ...comment,
              text: actualText, // Return the cleaned text without metadata
              isReply: true,
              parentCommentId: parentCommentId
            };
          }

          // Regular comment (not a reply)
          return {
            ...comment,
            isReply: false,
            parentCommentId: null
          };
        });

        return {
          ...post,
          comments: processedComments,
          numberOfLikes,
          isLikeByMe: post.likes.length > 0,
        };
      });

      return postsWithExtras;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  async addComment(userId: string, postId: string, body: AddCommentDto) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId },
      include: { user: true } // Include the post owner's data
    });

    if (!post) {
      throw new ForbiddenException(
        this.i18n.translate('t.post_not_found', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const comment = await this.prisma.comment.create({
      data: {
        text: body.comment,
        postId: postId,
        userId: userId,
      },
    });

    // Only send notification if the commenter is not the post owner
    if (userId !== post.userId) {
      // Get user information for the notification
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true }
      });

      // Send both push notification and store in database
      await this.pushNotificationService.sendCommentNotification(
        userId,           // commenterId
        // post.userId,      // postOwnerId
        // postId,           // postId
        // comment.id,       // commentId
        // body.comment      // commentText
      );

      // Store notification in database
      await this.pushNotificationCommentService.sendCommentNotification(
        userId,           // commenterId
        post.userId,      // postOwnerId
        postId,           // postId
        comment.id,       // commentId
        body.comment      // commentText
      );
    }

    this.updateTotalComments(postId);
    return comment;
  }

  async addReply(
    userId: string,
    postId: string,
    commentId: string,
    body: AddReplyDto,
  ) {
    // Verify that both post and comment exist
    const post = await this.prisma.post.findFirst({
      where: { id: postId },
      include: { user: true } // Include the post owner's data
    });

    if (!post) {
      throw new ForbiddenException(
        this.i18n.translate('t.post_not_found', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const parentComment = await this.prisma.comment.findFirst({
      where: { id: commentId, postId: postId },
      include: { user: true }
    });

    if (!parentComment) {
      throw new ForbiddenException(
        this.i18n.translate('t.comment_not_found', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // Format the reply text with metadata to indicate it's a reply
    const replyMetadata = `[REPLY:${commentId}]`;
    const replyText = `${replyMetadata} ${body.reply}`;

    // Create the reply as a regular comment but with metadata in the text
    const reply = await this.prisma.comment.create({
      data: {
        text: replyText,
        postId: postId,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            userType: true,
          },
        }
      }
    });

    // Send notification to the parent comment owner if it's not the same user
    if (userId !== parentComment.userId) {
      await this.pushNotificationService.sendCommentNotification({
        commenterId: userId,
        postOwnerId: post.userId,
        postId: postId,
        // commentId: comment.id,
        // commentText: body.comment,
        isReply: false
      });

    }

    // Also notify post owner if different from comment owner and current user
    if (post.userId !== parentComment.userId && post.userId !== userId) {
      await this.pushNotificationService.sendCommentNotification({
        commenterId: userId,
        postOwnerId: parentComment.userId,
        postId: postId,
        commentId: reply.id,
        commentText: body.reply,
        isReply: true,
        parentCommentId: commentId
      });
    }

    // Store notifications in database using the comment notification service
    // This will handle both parent comment owner and post owner notifications
    await this.pushNotificationService.sendCommentNotification({
      commenterId: userId,
      postOwnerId: post.userId,
      postId: postId,
      commentId: reply.id,
      commentText: body.reply,
      isReply: true,
      parentCommentId: commentId
    });

    await this.updateTotalComments(postId);

    // Clean up the response before returning it
    return {
      ...reply,
      text: body.reply, // Return the clean reply text without metadata
      isReply: true,
      parentCommentId: commentId
    };
  }

  async deleteComment(userId: string, postId: string, commentId: string) {
    // Find the comment to check ownership and existence
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    // Check if the comment exists and if the user is the owner of the comment
    if (!comment || comment.userId !== userId) {
      throw new ForbiddenException(
        this.i18n.translate('t.comment_not_found_or_not_authorized', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // Delete the comment
    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    // Update the total comment count on the post if needed
    this.updateTotalComments(postId);

    return { message: 'Comment deleted successfully' };
  }

  async getComments(postId: string, page: number, pageSize: number) {
    if (page === 0) {
      throw new ForbiddenException(
        this.i18n.translate('t.page_must_be_greater_than_0', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const skip = (page - 1) * pageSize;

    const comments = await this.prisma.comment.findMany({
      where: { postId: postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            userType: true,
          },
        },
      },
      skip,
      take: pageSize,
    });

    // Process comments to identify replies and their parent comments
    const processedComments = comments.map(comment => {
      // Check if this comment is a reply (has metadata)
      const replyMatch = comment.text.match(/^\[REPLY:([^\]]+)\]\s+(.*)/);

      if (replyMatch) {
        // Extract the parent comment ID and the actual comment text
        const parentCommentId = replyMatch[1];
        const actualText = replyMatch[2];

        return {
          ...comment,
          text: actualText, // Return the cleaned text without metadata
          isReply: true,
          parentCommentId: parentCommentId
        };
      }

      // Regular comment (not a reply)
      return {
        ...comment,
        isReply: false,
        parentCommentId: null
      };
    });

    return processedComments;
  }

  async likePost(userId: string, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId },
    });

    if (!post) {
      throw new ForbiddenException(
        this.i18n.translate('t.post_not_found', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const like = await this.prisma.like.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (like) {
      await this.prisma.like.delete({
        where: { id: like.id },
      });
      return {
        message: this.i18n.translate('t.post_unliked_successfuly', {
          lang: I18nContext.current().lang,
        }),
        isLikeByMe: false,
      };
    }

    await this.prisma.like.create({
      data: {
        postId: postId,
        userId: userId,
      },
    });
    this.updateTotalLikes(postId);

    try {
      // Notify post owner on like (skip self-like)
      if (userId !== post.userId) {
        await this.pushNotificationService.sendLikeNotification({
          likerId: userId,
          postOwnerId: post.userId,
          postId: postId,
        });
      }
    } catch (e) {
      // Swallow notification errors to not block like action
    }

    return {
      message: this.i18n.translate('t.post_liked_successfuly', {
        lang: I18nContext.current().lang,
      }),
      isLikeByMe: true,
    };
  }

  async getLikes(postId: string, page: number, pageSize: number) {
    if (page === 0) {
      throw new ForbiddenException(
        this.i18n.translate('t.page_must_be_greater_than_0', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const skip = (page - 1) * pageSize;

    const [likes, totalLikesCount] = await Promise.all([
      this.prisma.like.findMany({
        where: { postId: postId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              userType: true,
            },
          },
        },
        skip,
        take: pageSize,
      }),
      this.prisma.like.count({
        where: { postId: postId },
      }),
    ]);

    return { likes, totalLikesCount };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId },
    });

    if (!post) {
      throw new ForbiddenException(
        this.i18n.translate('t.post_not_found', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    if (post.userId !== userId) {
      throw new ForbiddenException(
        this.i18n.translate('t.you_are_not_allowed_to_delete_this_post', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });
    return {
      message: this.i18n.translate('t.post_deleted_successfuly', {
        lang: I18nContext.current().lang,
      }),
    };
  }

  private async updateTotalLikes(postId: string) {
    const aggregate = await this.prisma.like.aggregate({
      where: {
        postId,
      },
      _count: true,
    });

    await this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        total_likes: aggregate._count,
      },
    });
  }

  private async updateTotalComments(postId: string) {
    const aggregate = await this.prisma.comment.aggregate({
      where: {
        postId,
      },
      _count: true,
    });

    await this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        total_comments: aggregate._count,
      },
    });
  }

  /**
   * Get the count of unread comments and likes on posts since the user last viewed them
   * @param userId ID of the current user
   * @returns Object with unread counts
   */
  async getUnreadCount(userId: string) {
    // Get all posts from friends and user
    const posts = await this.prisma.post.findMany({
      where: {
        OR: [
          { userId },
          {
            user: {
              OR: [
                {
                  friends1: {
                    some: {
                      user2Id: userId,
                      status: 'ACCEPTED',
                    },
                  },
                },
                {
                  friends2: {
                    some: {
                      user1Id: userId,
                      status: 'ACCEPTED',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        total_comments: true,
        total_likes: true,
        viewStatus: {
          where: {
            userId
          }
        },
        comments: {
          select: {
            id: true,
            createdAt: true,
          }
        },
        likes: {
          select: {
            id: true,
            createdAt: true,
          }
        }
      }
    });

    let unreadComments = 0;
    let unreadLikes = 0;

    // For each post, calculate unread interactions
    posts.forEach(post => {
      const viewStatus = post.viewStatus[0]; // Get user's view status for this post

      if (!viewStatus) {
        // User has never viewed this post, so all comments and likes are new
        unreadComments += post.comments.length;
        unreadLikes += post.likes.length;
      } else {
        // Count only comments and likes that came after last view
        const lastViewedAt = new Date(viewStatus.lastViewedAt);

        const newComments = post.comments.filter(comment =>
          comment.createdAt > lastViewedAt
        ).length;

        const newLikes = post.likes.filter(like =>
          like.createdAt > lastViewedAt
        ).length;

        unreadComments += newComments;
        unreadLikes += newLikes;
      }
    });

    return {
      unreadComments,
      unreadLikes,
      totalUnread: unreadComments + unreadLikes
    };
  }

  /**
   * Mark a post as viewed by updating the LastViewedAt timestamp
   * @param userId ID of the current user 
   * @param postId ID of the post being viewed
   */
  async markPostAsViewed(userId: string, postId: string) {
    await this.prisma.postViewStatus.upsert({
      where: {
        userId_postId: {
          userId,
          postId
        }
      },
      update: {
        lastViewedAt: new Date(),
      },
      create: {
        userId,
        postId,
        lastViewedAt: new Date(),
      }
    });

    return { success: true };
  }
}
