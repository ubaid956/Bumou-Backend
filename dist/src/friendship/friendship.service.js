"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendshipService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const nestjs_i18n_1 = require("nestjs-i18n");
const push_notification_service_1 = require("../aliyun-Notification/push-notification.service");
const notification_payload_dto_1 = require("../aliyun-Notification/dto/notification-payload.dto");
const user_service_1 = require("../user/user.service");
let FriendshipService = class FriendshipService {
    constructor(prisma, i18n, pushNotificationService, userService) {
        this.prisma = prisma;
        this.i18n = i18n;
        this.pushNotificationService = pushNotificationService;
        this.userService = userService;
    }
    async removeFriend(user, friendId) {
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
                    console.error(error);
                });
            }
            if (!friendship) {
                throw new common_1.ForbiddenException(this.i18n.translate('t.friendship_not_found', {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                }));
            }
            await this.prisma.friendship.delete({
                where: {
                    id: friendship.id,
                },
            });
            return {
                message: this.i18n.translate('t.friend_removed', {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                }),
            };
        }
        catch (error) {
            throw new Error(this.i18n.translate('t.friendship_not_found', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
    }
    async getFriendships(userId) {
        const friendships = await this.prisma.friendship.findMany({
            where: {
                AND: [
                    {
                        OR: [{ user1Id: userId }, { user2Id: userId }],
                    },
                    { status: client_1.FriendshipStatus.ACCEPTED },
                ],
            },
            include: {
                user1: true,
                user2: true,
            },
        });
        const friendsData = friendships.map((friendship) => {
            const friendUser = userId === friendship.user1Id ? friendship.user2 : friendship.user1;
            delete friendUser.password;
            return { friendshipId: friendship.id, ...friendUser };
        });
        return friendsData;
    }
    async getPendingFriendship(userId) {
        const pendingFriendship = await this.prisma.friendship.findMany({
            where: {
                user2Id: userId,
                status: client_1.FriendshipStatus.PENDING,
            },
        });
        return pendingFriendship;
    }
    async acceptFriendship(user, request) {
        const friendship = await this.prisma.friendship.findFirst({
            where: {
                id: request.friendshipId,
                user2Id: user.id,
            },
        });
        if (!friendship) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.friendship_not_found', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        if (friendship.status === client_1.FriendshipStatus.ACCEPTED) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.friendship_already_accepted', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        if (request.status === client_1.FriendshipStatus.REJECTED) {
            await this.prisma.friendship.delete({
                where: {
                    id: request.friendshipId,
                },
            });
            return {
                message: this.i18n.translate('t.friend_request_rejected_successfuly', {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                }),
            };
        }
        const updatedFriendship = await this.prisma.friendship.update({
            where: {
                id: request.friendshipId,
            },
            data: {
                status: client_1.FriendshipStatus.ACCEPTED,
            },
        });
        const user1 = await this.userService.getUserById(friendship.user1Id);
        this.pushNotificationService.sendPushNotification({
            userIds: [friendship.user1Id],
            title: this.i18n.translate('t.friend_request_accepted', {
                lang: user1.local || nestjs_i18n_1.I18nContext.current().lang,
            }),
            content: user.firstName + ' ' + user.lastName + ' ' +
                this.i18n.translate('t.has_accepted_your_friend_request', {
                    lang: user1.local || nestjs_i18n_1.I18nContext.current().lang,
                }),
            type: notification_payload_dto_1.NotificationType.FRIENDSHIP,
            data: {
                userId: user.id,
            },
        });
        return updatedFriendship;
    }
    async addFriend(userData, addFriendDto) {
        const friendId = addFriendDto.userId;
        const friend = await this.prisma.user.findUnique({
            where: {
                id: friendId,
            },
        });
        if (!friend) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.requested_user_not_found', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
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
            if (friendship.status === client_1.FriendshipStatus.ACCEPTED) {
                throw new common_1.ForbiddenException(this.i18n.translate('t.friendship_already_exists', {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                }));
            }
            else if (friendship.status === client_1.FriendshipStatus.PENDING) {
                throw new common_1.ForbiddenException(this.i18n.translate('t.friendship_request_already_sent', {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                }));
            }
            else if (friendship.status === client_1.FriendshipStatus.REJECTED) {
                throw new common_1.ForbiddenException(this.i18n.translate('t.friendship_request_already_rejected', {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                }));
            }
            else {
                throw new common_1.ForbiddenException(this.i18n.translate('t.unknown_friendship_status', {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                }));
            }
        }
        const newFriendship = await this.prisma.friendship.create({
            data: {
                user1Id: userData.id,
                user2Id: friendId,
                status: client_1.FriendshipStatus.PENDING,
            },
        });
        this.pushNotificationService.sendPushNotification({
            userIds: [friendId],
            title: this.i18n.translate('t.new_friend_request', {
                lang: friend.local || nestjs_i18n_1.I18nContext.current().lang,
            }),
            content: userData.firstName + ' ' + userData.lastName + ' ' +
                this.i18n.translate('t.has_sent_you_a_friend_request', {
                    lang: friend.local || nestjs_i18n_1.I18nContext.current().lang,
                }),
            type: notification_payload_dto_1.NotificationType.FRIENDSHIP,
            data: {
                userId: userData.id,
            },
        });
        return newFriendship;
    }
    async getFriendSuggestions(user, page, pageSize) {
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
    async searchFriends(userId, searchDto) {
        const { query, page = 1, pageSize = 20 } = searchDto;
        const skip = (page - 1) * pageSize;
        const friendships = await this.prisma.friendship.findMany({
            where: {
                AND: [
                    {
                        OR: [{ user1Id: userId }, { user2Id: userId }],
                    },
                    { status: client_1.FriendshipStatus.ACCEPTED },
                ],
            },
            select: {
                id: true,
                user1Id: true,
                user2Id: true,
            },
        });
        const friendIds = friendships.map((friendship) => friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id);
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
        const totalPages = Math.ceil(totalCount / pageSize);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        const friendsWithFriendshipIds = friends.map((friend) => {
            const friendship = friendships.find((fs) => fs.user1Id === friend.id || fs.user2Id === friend.id);
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
};
exports.FriendshipService = FriendshipService;
exports.FriendshipService = FriendshipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nestjs_i18n_1.I18nService,
        push_notification_service_1.PushNotificationService,
        user_service_1.UserService])
], FriendshipService);
//# sourceMappingURL=friendship.service.js.map