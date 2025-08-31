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
exports.HelpChatService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const push_notification_service_1 = require("../../aliyun-Notification/push-notification.service");
const notification_payload_dto_1 = require("../../aliyun-Notification/dto/notification-payload.dto");
let HelpChatService = class HelpChatService {
    constructor(prisma, pushNotificationService) {
        this.prisma = prisma;
        this.pushNotificationService = pushNotificationService;
    }
    async handleNewHelpMessage(payload) {
        console.log('Help message received: ', payload);
        try {
            const message = await this.prisma.helpMessage.create({
                data: {
                    message: payload.message,
                    helpId: payload.helpId,
                    senderId: payload.senderId,
                    reply_id: payload.reply_id,
                    status: client_1.ChatroomMessageStatus.SENT,
                    type: payload.type,
                    locationLat: payload.locationLat,
                    locationLng: payload.locationLng,
                },
                include: {
                    sender: true,
                    help: {
                        include: {
                            requestedBy: true,
                            helper: true,
                        },
                    },
                },
            });
            let sentTo = '';
            if (message.help.requestedById == payload.senderId)
                sentTo = message.help.helperId;
            else
                sentTo = message.help.requestedById;
            let userIds = [sentTo];
            const notificationPayload = {
                userIds: userIds,
                type: notification_payload_dto_1.NotificationType.HELP,
                title: 'Help Message',
                content: payload.message,
                data: payload.message,
            };
            this.pushNotificationService.notificationAliPush(notificationPayload);
            return message;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException('Help request not found');
                }
                throw new common_1.ForbiddenException(`Code: ${error.code}, Message: ${error.message}`);
            }
            throw error;
        }
    }
    async deleteHelpMessage(messageId, userId) {
        const message = await this.prisma.helpMessage.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Help message not found');
        }
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this message');
        }
        return this.prisma.helpMessage.delete({
            where: { id: messageId },
        });
    }
};
exports.HelpChatService = HelpChatService;
exports.HelpChatService = HelpChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        push_notification_service_1.PushNotificationService])
], HelpChatService);
//# sourceMappingURL=help-chat.service.js.map