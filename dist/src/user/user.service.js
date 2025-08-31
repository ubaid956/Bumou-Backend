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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const nestjs_i18n_1 = require("nestjs-i18n");
let UserService = class UserService {
    constructor(prisma, i18n) {
        this.prisma = prisma;
        this.i18n = i18n;
    }
    async searchUser(userId, query) {
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
        const filteredUsers = users.filter((user) => user.id !== userId);
        const usersWithoutPassword = filteredUsers.map((user) => {
            delete user.password;
            return user;
        });
        return usersWithoutPassword;
    }
    async getUserById(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.user_not_found_with_the_given_id', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }) + userId);
        }
        delete user.password;
        return user;
    }
    async getUsersByIds(userIds) {
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
    async updateUser(userId, updateUserDto) {
        try {
            const user = await this.prisma.user.update({
                where: { id: userId },
                data: updateUserDto,
            });
            delete user.password;
            return user;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new common_1.ForbiddenException(this.i18n.translate('t.email_or_username_already_exists', {
                        lang: nestjs_i18n_1.I18nContext.current().lang,
                    }));
                }
            }
            throw error;
        }
    }
    async getDeviceTokens(userId) {
        console.log('Tokens found 4');
        const tokens = await this.prisma.userDeviceToken.findMany({
            where: { userId: { equals: userId } },
        });
        console.log(tokens);
        return tokens;
    }
    async deleteUser(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.user_not_found_with_the_given_id', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }) + userId);
        }
        const deleteUser = this.prisma.user.delete({ where: { id: userId } });
        const chatRoomReadStatus = this.prisma.chatroomReadStatus.deleteMany({
            where: { userId: userId },
        });
        return this.prisma.$transaction([chatRoomReadStatus, deleteUser]);
    }
    async updateIsHelping(userId, payload) {
        console.log('payload', payload);
        const isHelping = payload.isHelping;
        console.log('isHelping', isHelping);
        if (isHelping === undefined || isHelping === null) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.missing_required_data', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        return await this.prisma.user.update({
            where: { id: userId },
            data: { isHelping },
        });
    }
    async getUnreadCount(userId) {
        const unreadNotificationsCount = await this.prisma.notifications.count({
            where: {
                userId: userId,
                read: false
            }
        });
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
        for (const chatroom of chatrooms) {
            if (chatroom.messages.length > 0) {
                const lastMessage = chatroom.messages[0];
                if (lastMessage.senderId !== userId && lastMessage.readBy.length === 0) {
                    unreadMessagesCount++;
                }
            }
        }
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
        posts.forEach(post => {
            const viewStatus = post.viewStatus[0];
            if (!viewStatus) {
                unreadMomentsCount += post.comments.length + post.likes.length;
            }
            else {
                const lastViewedAt = new Date(viewStatus.lastViewedAt);
                const newComments = post.comments.filter(comment => comment.createdAt > lastViewedAt).length;
                const newLikes = post.likes.filter(like => like.createdAt > lastViewedAt).length;
                unreadMomentsCount += newComments + newLikes;
            }
        });
        return {
            moments: unreadMomentsCount,
            messages: unreadMessagesCount,
            notifications: unreadNotificationsCount,
            totalUnread: unreadMomentsCount + unreadMessagesCount + unreadNotificationsCount
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nestjs_i18n_1.I18nService])
], UserService);
//# sourceMappingURL=user.service.js.map