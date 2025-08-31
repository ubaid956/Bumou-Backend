import { ForbiddenException, Injectable } from '@nestjs/common';
import { AddFriendDto, SearchFriendsDto, UpdateFriendshipDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendshipStatus, User } from '@prisma/client';
import { I18nContext, I18nService } from 'nestjs-i18n';
// import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { PushNotificationService } from 'src/aliyun-Notification/push-notification.service';
import { NotificationType } from 'src/aliyun-Notification/dto/notification-payload.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FriendshipService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly userService: UserService,
  ) { }

  async removeFriend(user: User, friendId: string) {
    try {
      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              user1Id: user.id,
              user2Id: friendId,
            },
            {
              user1Id: friendId,
              user2Id: user.id,
            },
          ],
        },
      });

      const chartRoom = await this.prisma.chatroom.findFirst({
        where: {
          AND: [
            {
              members: {
                some: {
                  id: user.id,
                },
              },
            },
            {
              members: {
                some: {
                  id: friendId,
                },
              },
            },
          ],

        },
      });
      if (chartRoom) {
        const chatRoomReadStatus = this.prisma.chatroomReadStatus.deleteMany({
          where: { chatroom: chartRoom },
        });
        const deleteChatRoom = this.prisma.chatroom.delete({
          where: { id: chartRoom.id },
        }).then(function (result) {
          console.log(result);
        })
          .catch(function (error) {

            console.error(error)
          });


      }




      if (!friendship) {
        throw new ForbiddenException(
          this.i18n.translate('t.friendship_not_found', {
            lang: I18nContext.current().lang,
          }),
        );
      }

      await this.prisma.friendship.delete({
        where: {
          id: friendship.id,
        },
      });

      return {
        message: this.i18n.translate('t.friend_removed', {
          lang: I18nContext.current().lang,
        }),
      };
    } catch (error) {
      throw new Error(
        this.i18n.translate('t.friendship_not_found', {
          lang: I18nContext.current().lang,
        }),
      );
    }
  }

  async getFriendships(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [{ user1Id: userId }, { user2Id: userId }],
          },
          { status: FriendshipStatus.ACCEPTED },
        ],
      },
      include: {
        user1: true,
        user2: true,
      },
    });

    const friendsData = friendships.map((friendship) => {
      const friendUser =
        userId === friendship.user1Id ? friendship.user2 : friendship.user1;
      delete friendUser.password;
      return { friendshipId: friendship.id, ...friendUser };
    });

    return friendsData;
  }

  async getPendingFriendship(userId: string) {
    const pendingFriendship = await this.prisma.friendship.findMany({
      where: {
        user2Id: userId,
        status: FriendshipStatus.PENDING,
      },
    });
    return pendingFriendship;
  }

  async acceptFriendship(user: User, request: UpdateFriendshipDto) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        id: request.friendshipId,
        user2Id: user.id,
      },
    });

    if (!friendship) {
      throw new ForbiddenException(
        this.i18n.translate('t.friendship_not_found', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    if (friendship.status === FriendshipStatus.ACCEPTED) {
      throw new ForbiddenException(
        this.i18n.translate('t.friendship_already_accepted', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    if (request.status === FriendshipStatus.REJECTED) {
      await this.prisma.friendship.delete({
        where: {
          id: request.friendshipId,
        },
      });
      return {
        message: this.i18n.translate('t.friend_request_rejected_successfuly', {
          lang: I18nContext.current().lang,
        }),
      };
    }

    const updatedFriendship = await this.prisma.friendship.update({
      where: {
        id: request.friendshipId,
      },
      data: {
        status: FriendshipStatus.ACCEPTED,
      },
    });

    const user1 = await this.userService.getUserById(friendship.user1Id);

    // this.pushNotificationService.sendPushNotification({
    //   userIds: [friendship.user1Id],
    //   title: this.i18n.translate('t.friend_request_accepted', {
    //     lang: user1.local || I18nContext.current().lang,
    //   }),
    //   subtitle: this.i18n.translate(
    //     user.firstName +
    //       ' ' +
    //       user.lastName +
    //       ' ' +
    //       't.friend_request_accepted',
    //     { lang: user1.local || I18nContext.current().lang },
    //   ),
    //   type: NotificationType.FRIENDSHIP,
    //   data: {
    //     userId: user.id,
    //   },
    // });

    // this.pushNotificationService.notificationAliPush({
    //   userIds: [friendship.user1Id],
    //   title: this.i18n.translate('t.friend_request_accepted', {
    //     lang: user1.local || I18nContext.current().lang,
    //   }),
    //   content: this.i18n.translate(
    //     user.firstName +
    //       ' ' +
    //       user.lastName +
    //       ' ' +
    //       't.friend_request_accepted',
    //     { lang: user1.local || I18nContext.current().lang },
    //   ),
    //   type: NotificationType.FRIENDSHIP,
    //   data: {
    //     userId: user.id,
    //   },
    // });

    this.pushNotificationService.sendPushNotification({
      userIds: [friendship.user1Id],
      title: this.i18n.translate('t.friend_request_accepted', {
        lang: user1.local || I18nContext.current().lang,
      }),
      content: user.firstName + ' ' + user.lastName + ' ' +
        this.i18n.translate('t.has_accepted_your_friend_request', {
          lang: user1.local || I18nContext.current().lang,
        }),
      type: NotificationType.FRIENDSHIP,
      data: {
        userId: user.id,
      },
    });

    return updatedFriendship;
  }

  async addFriend(userData: User, addFriendDto: AddFriendDto) {
    const friendId = addFriendDto.userId;
    const friend = await this.prisma.user.findUnique({
      where: {
        id: friendId,
      },
    });

    if (!friend) {
      throw new ForbiddenException(
        this.i18n.translate('t.requested_user_not_found', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            user1Id: userData.id,
            user2Id: friendId,
          },
          {
            user1Id: friendId,
            user2Id: userData.id,
          },
        ],
      },
    });

    if (friendship) {
      if (friendship.status === FriendshipStatus.ACCEPTED) {
        throw new ForbiddenException(
          this.i18n.translate('t.friendship_already_exists', {
            lang: I18nContext.current().lang,
          }),
        );
      } else if (friendship.status === FriendshipStatus.PENDING) {
        throw new ForbiddenException(
          this.i18n.translate('t.friendship_request_already_sent', {
            lang: I18nContext.current().lang,
          }),
        );
      } else if (friendship.status === FriendshipStatus.REJECTED) {
        throw new ForbiddenException(
          this.i18n.translate('t.friendship_request_already_rejected', {
            lang: I18nContext.current().lang,
          }),
        );
      } else {
        throw new ForbiddenException(
          this.i18n.translate('t.unknown_friendship_status', {
            lang: I18nContext.current().lang,
          }),
        );
      }
    }
    const newFriendship = await this.prisma.friendship.create({
      data: {
        user1Id: userData.id,
        user2Id: friendId,
        status: FriendshipStatus.PENDING,
      },
    });

    // this.pushNotificationService.sendPushNotification({
    //   userIds: [friendId],
    //   title: this.i18n.translate('t.new_friend_request', {
    //     lang: friend.local || I18nContext.current().lang,
    //   }),
    //   subtitle:
    //     userData.firstName +
    //     ' ' +
    //     userData.lastName +
    //     this.i18n.translate('t.has_sent_you_a_friend_request', {
    //       lang: friend.local || I18nContext.current().lang,
    //     }),
    //   type: NotificationType.FRIENDSHIP,
    //   data: {
    //     userId: userData.id,
    //   },
    // });

    // this.pushNotificationService.notificationAliPush({
    //   userIds: [friendId],
    //   title: this.i18n.translate('t.new_friend_request', {
    //     lang: friend.local || I18nContext.current().lang,
    //   }),
    //   content:
    //     userData.firstName +
    //     ' ' +
    //     userData.lastName +
    //     this.i18n.translate('t.has_sent_you_a_friend_request', {
    //       lang: friend.local || I18nContext.current().lang,
    //     }),
    //   type: NotificationType.FRIENDSHIP,
    //   data: {
    //     userId: userData.id,
    //   },
    // });


    this.pushNotificationService.sendPushNotification({
      userIds: [friendId],
      title: this.i18n.translate('t.new_friend_request', {
        lang: friend.local || I18nContext.current().lang,
      }),
      content: userData.firstName + ' ' + userData.lastName + ' ' +
        this.i18n.translate('t.has_sent_you_a_friend_request', {
          lang: friend.local || I18nContext.current().lang,
        }),
      type: NotificationType.FRIENDSHIP,
      data: {
        userId: userData.id,
      },
    });

    return newFriendship;
  }

  async getFriendSuggestions(user: User, page: number, pageSize: number) {
    const suggestedFriends = await this.prisma.user.findMany({
      where: {
        id: {
          not: user.id,
        },
        userType: user.userType,
        friends1: {
          none: {
            user2Id: user.id,
          },
        },
        friends2: {
          none: {
            user1Id: user.id,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return suggestedFriends;
  }

  /**
   * Search for friends with pagination
   * @param userId User ID of the current user
   * @param searchDto Contains search query and pagination options
   * @returns Paginated list of friends matching the search criteria
   */
  async searchFriends(userId: string, searchDto: SearchFriendsDto) {
    const { query, page = 1, pageSize = 20 } = searchDto;
    const skip = (page - 1) * pageSize;

    // Get all friendship IDs where the user is involved
    const friendships = await this.prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [{ user1Id: userId }, { user2Id: userId }],
          },
          { status: FriendshipStatus.ACCEPTED },
        ],
      },
      select: {
        id: true,
        user1Id: true,
        user2Id: true,
      },
    });

    // Extract friend IDs from friendships
    const friendIds = friendships.map((friendship) =>
      friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id
    );

    // Search users who are friends using the extracted IDs and matching the search query
    const friends = await this.prisma.user.findMany({
      where: {
        id: { in: friendIds },
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePicture: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: pageSize,
    });

    // Count total matches for pagination info
    const totalCount = await this.prisma.user.count({
      where: {
        id: { in: friendIds },
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Map friends to include their friendship IDs
    const friendsWithFriendshipIds = friends.map((friend) => {
      const friendship = friendships.find(
        (fs) => fs.user1Id === friend.id || fs.user2Id === friend.id
      );

      return {
        ...friend,
        friendshipId: friendship ? friendship.id : null,
      };
    });

    return {
      data: friendsWithFriendshipIds,
      meta: {
        totalCount,
        page,
        pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
