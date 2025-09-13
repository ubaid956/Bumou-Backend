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
var HelpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const push_notification_service_1 = require("../aliyun-Notification/push-notification.service");
const notification_payload_dto_1 = require("../aliyun-Notification/dto/notification-payload.dto");
const client_1 = require("@prisma/client");
const chat_gateway_1 = require("../chat/gateway/chat.gateway");
const help_chat_service_1 = require("../chat/service/help-chat.service");
let HelpService = HelpService_1 = class HelpService {
    constructor(prisma, notification, chatGateway, helpChatService) {
        this.prisma = prisma;
        this.notification = notification;
        this.chatGateway = chatGateway;
        this.helpChatService = helpChatService;
    }
    async getMyPendingHelpRequests(userId) {
        const helps = await this.prisma.help.findMany({
            where: {
                requestedById: userId,
                status: client_1.HelpStatus.PENDING,
                createdAt: {
                    gte: new Date(new Date().getTime() - HelpService_1.expiresIn),
                },
            },
            include: {
                requestedBy: true,
                helper: true,
                messages: {
                    include: { sender: true },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            take: 1,
            orderBy: {
                createdAt: 'desc',
            },
        });
        return helps.length > 0 ? helps[0] : null;
    }
    async getOngoingHelp(userId) {
        const myHelp = await this.prisma.help.findMany({
            where: {
                OR: [
                    {
                        requestedById: userId,
                    },
                    {
                        helperId: userId,
                    },
                ],
                status: {
                    in: [client_1.HelpStatus.ACCEPTED],
                },
            },
            include: {
                requestedBy: true,
                helper: true,
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                    include: {
                        sender: true,
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
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        });
        const chatroomWithUnreadCount = myHelp.map((chatroom) => {
            return {
                ...chatroom,
                unreadCount: chatroom._count?.messages,
            };
        });
        return chatroomWithUnreadCount;
    }
    async getIncomingRequests(userId) {
        const currentTime = new Date();
        const help = await this.prisma.help.findMany({
            where: {
                requestedById: {
                    not: userId,
                },
                status: client_1.HelpStatus.PENDING,
                createdAt: {
                    gte: new Date(currentTime.getTime() - HelpService_1.expiresIn),
                },
            },
            include: {
                requestedBy: true,
                helper: true,
                messages: {
                    include: { sender: true },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            take: 50,
            orderBy: {
                createdAt: 'desc',
            },
        });
        return help;
    }
    async askForHelp(id, payload) {
        console.log('payload', payload);
        const help = await this.prisma.help.create({
            data: {
                messages: {
                    create: {
                        message: payload.message,
                        type: client_1.ChatroomMessageType.TEXT,
                        sender: {
                            connect: {
                                id,
                            },
                        },
                    },
                },
                requestedBy: {
                    connect: {
                        id,
                    },
                },
            },
            include: {
                requestedBy: true,
                messages: {
                    include: { sender: true },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
        });
        const userIds = await this.prisma.user.findMany({
            where: {
                isHelping: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: 500,
            select: {
                id: true,
            },
        });
        let enHelpMessage = payload.message;
        let zhHelpMessage = payload.message;
        if (!enHelpMessage) {
            enHelpMessage = 'Someone needs help!';
            zhHelpMessage = '有人需要帮助！';
        }
        const notificationPayload = {
            enHelpMessage,
            zhHelpMessage,
            ...help,
        };
        await this.notification.sendHelpNotification(notificationPayload, userIds.map((user) => user.id));
        this.chatGateway.emitHelpRequest(help);
        return help;
    }
    async cancelHelp(id) {
        try {
            const help = await this.prisma.help.delete({
                where: {
                    id,
                    status: client_1.HelpStatus.PENDING,
                },
                include: {
                    requestedBy: true,
                    helper: true,
                    messages: {
                        include: { sender: true },
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 1,
                    },
                },
            });
            this.chatGateway.emitHelpRequestRemove(id);
            return {
                success: true,
                message: 'Help request cancelled',
                help,
            };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException('找不到帮助请求');
                }
                throw new common_1.ForbiddenException(`Code: ${error.code}, Message: ${error.message}`);
            }
            throw error;
        }
    }
    async acceptHelp(userId, helpId) {
        try {
            const help = await this.prisma.help.update({
                where: {
                    id: helpId,
                    status: client_1.HelpStatus.PENDING,
                },
                data: {
                    status: client_1.HelpStatus.ACCEPTED,
                    helper: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
            this.chatGateway.emitHelpRequestRemove(helpId);
            const notificationPayload = {
                userIds: [help.requestedById],
                type: notification_payload_dto_1.NotificationType.HELP,
                title: "Help Request Accepted",
                content: '您的帮助请求已被接受',
                data: {
                    type: notification_payload_dto_1.NotificationType.HELP,
                    message: '您的帮助请求已被接受',
                    help,
                },
            };
            this.notification.sendPushNotification(notificationPayload);
            const message = await this.helpChatService.handleNewHelpMessage({
                message: '来这里帮忙！',
                helpId: helpId,
                senderId: userId,
                type: client_1.ChatroomMessageType.JOIN,
            });
            this.chatGateway.emitHelpMessage(message, [help.requestedById, userId]);
            return help;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException('找不到帮助请求');
                }
                throw new common_1.ForbiddenException(`Code: ${error.code}, 信息: ${error.message}`);
            }
            throw error;
        }
    }
    async deleteHelp(helpId) {
        return this.prisma.help.delete({ where: { id: helpId } });
    }
    async deleteHelpMessages(messageId, userId) {
        const message = await this.prisma.helpMessage.findUnique({
            where: { id: messageId },
            include: {
                help: {
                    include: {
                        requestedBy: true,
                        helper: true,
                    },
                },
            },
        });
        if (!message) {
            throw new common_1.ForbiddenException('Message not found');
        }
        console.log('Delete message debug:', {
            messageId,
            userId,
            userIdType: typeof userId,
            senderId: message.senderId,
            senderIdType: typeof message.senderId,
            requestedById: message.help.requestedById,
            helperId: message.help.helperId,
            isSender: message.senderId === userId,
            isRequestedBy: message.help.requestedById === userId,
            isHelper: message.help.helperId === userId,
            stringComparison: {
                senderIdEqualsUserId: message.senderId === userId,
                requestedByIdEqualsUserId: message.help.requestedById === userId,
                helperIdEqualsUserId: message.help.helperId === userId,
            },
            messageObject: message,
        });
        const canDelete = message.senderId === userId ||
            message.help.requestedById === userId ||
            message.help.helperId === userId;
        if (!canDelete) {
            throw new common_1.ForbiddenException('You do not have permission to delete this message');
        }
        const deletedMessage = await this.prisma.helpMessage.delete({
            where: { id: messageId }
        });
        const userIds = [];
        if (message.help.requestedById) {
            userIds.push(message.help.requestedById);
        }
        if (message.help.helperId) {
            userIds.push(message.help.helperId);
        }
        this.chatGateway.emitHelpMessageDeleted(messageId, message.helpId, userId);
        return deletedMessage;
    }
    async getHelpMessages(userId, helpId) {
        const helpMessages = await this.prisma.helpMessage.findMany({
            where: {
                helpId,
            },
            include: {
                sender: true,
            },
            take: 100,
            orderBy: {
                createdAt: 'desc',
            },
        });
        return helpMessages;
    }
    async markMessageAsRead(userId, helpMessageId, helpId) {
        let existingStatus = await this.prisma.helpReadStatus.findFirst({
            where: {
                userId,
                helpMessageId,
                helpId,
            },
        });
        if (existingStatus) {
            return existingStatus;
        }
        existingStatus = await this.prisma.helpReadStatus.create({
            data: {
                userId,
                helpMessageId,
                helpId,
            },
        });
        return existingStatus;
    }
};
exports.HelpService = HelpService;
HelpService.expiresIn = 2 * 60 * 60 * 1000;
exports.HelpService = HelpService = HelpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        push_notification_service_1.PushNotificationService,
        chat_gateway_1.ChatGateway,
        help_chat_service_1.HelpChatService])
], HelpService);
//# sourceMappingURL=help.service.js.map