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
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const nestjs_i18n_1 = require("nestjs-i18n");
const prisma_service_1 = require("../../prisma/prisma.service");
const push_notification_service_1 = require("../../aliyun-Notification/push-notification.service");
let MessageService = class MessageService {
    constructor(prisma, pushNotificationService) {
        this.prisma = prisma;
        this.pushNotificationService = pushNotificationService;
    }
    async onNewMessage(message) {
        const requestId = Math.random().toString(36).substring(7);
        const serverTime = new Date();
        nestjs_i18n_1.logger.log(`🔥 [MSG-SVC-REQ:${requestId}] onNewMessage called at ${serverTime.toISOString()}`);
        nestjs_i18n_1.logger.log(`📦 [MSG-SVC-REQ:${requestId}] Message details:`, {
            senderId: message?.senderId,
            receiverId: message?.receiverId,
            message: message?.message?.substring(0, 50) + '...',
            chatroomId: message?.chatroomId,
            type: message?.type
        });
        let chatroomId = message.chatroomId;
        if (!chatroomId) {
            chatroomId = [message.receiverId, message.senderId].sort().join('_');
        }
        let chatroom = await this.getChatRoomById(chatroomId, message.senderId);
        let lastMessage = message.message;
        if (message.type == client_1.ChatroomMessageType.TEXT) {
            lastMessage = message.message;
        }
        else {
            lastMessage = `*${message.type}*`;
        }
        if (!chatroom) {
            const friendship = await this.prisma.friendship.findFirst({
                where: {
                    OR: [
                        {
                            user1Id: message.senderId,
                            user2Id: message.receiverId,
                        },
                        {
                            user1Id: message.receiverId,
                            user2Id: message.senderId,
                        },
                    ],
                },
            });
            if (!friendship) {
                return {
                    message: "Friendship not found",
                };
            }
            chatroom = await this.prisma.chatroom.create({
                data: {
                    id: chatroomId,
                    lastMessage: lastMessage,
                    name: 'Private',
                    members: {
                        connect: [{ id: message.senderId }, { id: message.receiverId }],
                    },
                    messages: {
                        create: {
                            message: message.message,
                            type: message.type,
                            status: message.status,
                            senderId: message.senderId,
                            file: message.file,
                            reply_id: message.reply_id,
                            readBy: {
                                create: {
                                    userId: message.senderId,
                                    chatroomId: message.chatroomId,
                                },
                            },
                        },
                    },
                },
                include: {
                    members: true,
                    messages: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 1,
                        include: {
                            readBy: {
                                where: {
                                    userId: message.senderId,
                                },
                            },
                        },
                    },
                },
            });
            chatroom = { ...chatroom, unreadCount: 1 };
        }
        else {
            chatroom = await this.prisma.chatroom.update({
                where: {
                    id: chatroomId,
                },
                data: {
                    lastMessage: lastMessage,
                    messages: {
                        create: {
                            message: message.message,
                            type: message.type,
                            status: message.status,
                            senderId: message.senderId,
                            file: message.file,
                            reply_id: message.reply_id,
                            readBy: {
                                create: {
                                    userId: message.senderId,
                                    chatroomId: message.chatroomId,
                                },
                            },
                        },
                    },
                },
                include: {
                    members: true,
                    messages: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 1,
                        include: {
                            readBy: {
                                where: {
                                    userId: message.senderId,
                                },
                            },
                        },
                    },
                },
            });
            chatroom = await this.prisma.chatroom.findUnique({
                where: { id: chatroomId },
                include: {
                    members: true,
                    messages: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 1,
                        include: {
                            readBy: {
                                where: {
                                    userId: message.senderId,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            messages: {
                                where: {
                                    readBy: {
                                        none: {
                                            userId: message.receiverId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            chatroom = { ...chatroom, unreadCount: chatroom._count?.messages };
        }
        this.pushNotificationService.sendMessageNotification(message);
        nestjs_i18n_1.logger.log(`✅ [MSG-SVC-REQ:${requestId}] onNewMessage completed, calling push notification`);
        nestjs_i18n_1.logger.log(`📅 [MSG-SVC-REQ:${requestId}] Final message timestamp: ${chatroom.messages[0]?.createdAt?.toISOString()}`);
        nestjs_i18n_1.logger.debug('CHATROOM ' + chatroom);
        return {
            chatroom: chatroom,
            message: chatroom.messages[0],
        };
    }
    async getMessages(chatroomId, userId, page, pageSize) {
        page = Math.max(1, page);
        pageSize = Math.max(1, Math.min(100, pageSize));
        nestjs_i18n_1.logger.debug(`Getting messages for chatroom: ${chatroomId}, user: ${userId}, page: ${page}, pageSize: ${pageSize}`);
        let all_messages = await this.prisma.chatroomMessage.findMany({
            where: {
                chatroomId: chatroomId,
                readBy: {
                    none: {
                        userId: userId,
                    },
                },
            },
            include: {
                readBy: {
                    where: {},
                },
            },
        });
        all_messages.map((message_one) => {
            if (message_one.readBy == null) {
                nestjs_i18n_1.logger.debug('Message 4 :: ' + message_one.id);
                this.prisma.chatroomMessage.delete({
                    where: { id: message_one.id },
                }).then(function (result) {
                    console.log(result);
                })
                    .catch(function (error) {
                    console.error(error);
                });
            }
            else {
                this.prisma.chatroomReadStatus.create({
                    data: {
                        userId: userId,
                        messageId: message_one.id,
                        chatroomId: chatroomId,
                    },
                });
            }
        });
        return await this.prisma.chatroomMessage.findMany({
            where: {
                chatroomId: chatroomId,
                isDeleted: false,
            },
            include: {
                readBy: {
                    where: { userId: userId },
                },
                reply: true,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteMessage(messageId, userId) {
        const message = await this.prisma.chatroomMessage.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.ForbiddenException('Message not found');
        }
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this message');
        }
        return this.prisma.chatroomMessage.delete({
            where: { id: messageId },
        });
    }
    async deleteChatRoom(chatroomId) {
        const chartRoom = await this.prisma.chatroom.findUnique({
            where: { id: chatroomId },
        });
        if (!chartRoom) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.chatroom_not_found_with_the_given_id', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }) + chatroomId);
        }
        const chatRoomReadStatus = this.prisma.chatroomReadStatus.deleteMany({
            where: { chatroom: chartRoom },
        });
        const deleteChatRoom = this.prisma.chatroom.delete({
            where: { id: chatroomId },
        });
        return this.prisma.$transaction([chatRoomReadStatus, deleteChatRoom]);
    }
    async getChatRoomsByUser(userId, page, pageSize) {
        page = Math.max(1, page);
        pageSize = Math.max(1, Math.min(100, pageSize));
        console.log("fetching getChatRoomsByUser");
        nestjs_i18n_1.logger.debug('Fetching chatroom for ::  ' + userId);
        nestjs_i18n_1.logger.debug(`Pagination: page=${page}, pageSize=${pageSize}, skip=${(page - 1) * pageSize}`);
        const chatRooms = await this.prisma.chatroom.findMany({
            where: {
                members: {
                    some: {
                        id: userId,
                    },
                },
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
                updatedAt: 'desc',
            },
            include: {
                members: {
                    where: {
                        id: {
                            not: userId,
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                    include: {
                        readBy: {
                            where: {
                                userId,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                readBy: {
                                    none: {
                                        userId: userId,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const chatroomWithUnreadCount = chatRooms.map((chatroom) => {
            nestjs_i18n_1.logger.debug('CHATROOM UNREAD COUNT :: ' + chatroom._count?.messages);
            return {
                ...chatroom,
                unreadCount: chatroom._count?.messages,
            };
        });
        return chatroomWithUnreadCount;
    }
    async getChatRoomById(chatroomId, userId) {
        console.log("faching getChatRoomById");
        return this.prisma.chatroom.findUnique({
            where: { id: chatroomId },
            include: {
                members: true,
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                readBy: {
                                    none: {
                                        userId,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        push_notification_service_1.PushNotificationService])
], MessageService);
//# sourceMappingURL=message.service.js.map