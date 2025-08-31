import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async searchUser(userId: string, query: string) {
    // find user from query by username or email or first name or last name
    const users = await this.prisma.user.findMany({
      take: 20,
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    // remove current user from the list
    const filteredUsers = users.filter((user) => user.id !== userId);

    // remove password from the list
    const usersWithoutPassword = filteredUsers.map((user) => {
      delete user.password;
      return user;
    });

    return usersWithoutPassword;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ForbiddenException(
        this.i18n.translate('t.user_not_found_with_the_given_id', {
          lang: I18nContext.current().lang,
        }) + userId,
      );
    }

    delete user.password;

    return user;
  }

  async getUsersByIds(userIds: string[]) {
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    const usersWithoutPassword = users.map((user) => {
      delete user.password;
      return user;
    });

    return usersWithoutPassword;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: updateUserDto,
      });
      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            this.i18n.translate('t.email_or_username_already_exists', {
              lang: I18nContext.current().lang,
            }),
          );
        }
      }
      throw error;
    }
  }

  async getDeviceTokens(userId: string) {
    console.log('Tokens found 4');
    const tokens = await this.prisma.userDeviceToken.findMany({
      where: { userId: { equals: userId } },
    });
    console.log(tokens);
    return tokens;
  }
  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException(
        this.i18n.translate('t.user_not_found_with_the_given_id', {
          lang: I18nContext.current().lang,
        }) + userId,
      );
    }

    const deleteUser = this.prisma.user.delete({ where: { id: userId } });

    const chatRoomReadStatus = this.prisma.chatroomReadStatus.deleteMany({
      where: { userId: userId },
    });

    return this.prisma.$transaction([chatRoomReadStatus, deleteUser]);
  }

  async updateIsHelping(userId: string, payload: any) {
    console.log('payload', payload);

    const isHelping: boolean = payload.isHelping;
    console.log('isHelping', isHelping);

    if (isHelping === undefined || isHelping === null) {
      throw new ForbiddenException(
        this.i18n.translate('t.missing_required_data', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: { isHelping },
    });
  }

  /**
   * Get a unified count of all unread items across the application
   * @param userId Current user ID
   * @returns Object with counts of all unread items and total
   */
  async getUnreadCount(userId: string) {
    // Get unread notifications
    const unreadNotificationsCount = await this.prisma.notifications.count({
      where: {
        userId: userId,
        read: false
      }
    });

    // Get unread messages in chatrooms
    const chatrooms = await this.prisma.chatroom.findMany({
      where: {
        members: {
          some: {
            id: userId
          }
        }
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            readBy: {
              where: {
                userId: userId
              }
            }
          }
        }
      }
    });
    
    let unreadMessagesCount = 0;
    
    // Count unread messages in each chatroom
    for (const chatroom of chatrooms) {
      if (chatroom.messages.length > 0) {
        const lastMessage = chatroom.messages[0];
        
        // If sender is not the current user and the message hasn't been read
        if (lastMessage.senderId !== userId && lastMessage.readBy.length === 0) {
          unreadMessagesCount++;
        }
      }
    }

    // Get unread moments (comments and likes)
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

    let unreadMomentsCount = 0;

    // Calculate unread moments interactions
    posts.forEach(post => {
      const viewStatus = post.viewStatus[0];
      
      if (!viewStatus) {
        // User has never viewed this post, count all interactions
        unreadMomentsCount += post.comments.length + post.likes.length;
      } else {
        // Count only interactions after last view
        const lastViewedAt = new Date(viewStatus.lastViewedAt);
        
        const newComments = post.comments.filter(comment => 
          comment.createdAt > lastViewedAt
        ).length;
        
        const newLikes = post.likes.filter(like => 
          like.createdAt > lastViewedAt
        ).length;
        
        unreadMomentsCount += newComments + newLikes;
      }
    });

    // Return unified badge count
    return {
      moments: unreadMomentsCount,
      messages: unreadMessagesCount,
      notifications: unreadNotificationsCount,
      totalUnread: unreadMomentsCount + unreadMessagesCount + unreadNotificationsCount
    };
  }
}
