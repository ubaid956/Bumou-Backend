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
        this.recentMessages = new Set();
        setInterval(() => {
            this.recentMessages.clear();
            console.log('🧹 Cleared recent messages cache');
        }, 30000);
    }
    async handleHelpNotification(notificationData) {
        const callStack = new Error().stack;
        console.log('🚨 SENDING HELP NOTIFICATION - CALLED FROM:');
        console.log(callStack?.split('\n').slice(0, 5).join('\n'));
        console.log('📧 Notification to user:', notificationData.receiverId);
        console.log('📝 Message:', notificationData.message);
        console.log('🏷️ Title:', notificationData.title);
        const notificationPayload = {
            userIds: [notificationData.receiverId],
            type: notification_payload_dto_1.NotificationType.HELP,
            title: notificationData.title,
            content: notificationData.message,
            data: notificationData.data
        };
        console.log('📤 Sending push notification payload:', JSON.stringify(notificationPayload, null, 2));
        await this.pushNotificationService.sendPushNotification(notificationPayload);
        console.log('✅ Push notification sent successfully');
    }
    async handleNewHelpMessage(payload) {
        const callId = Date.now() + Math.random().toString(36).substr(2, 9);
        console.log('📨 HELP MESSAGE RECEIVED IN SERVICE - Call ID:', callId);
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));
        const messageKey = `${payload.helpId}-${payload.senderId}-${payload.message}-${Math.floor(Date.now() / 5000)}`;
        if (this.recentMessages.has(messageKey)) {
            console.log('🚫 DUPLICATE MESSAGE DETECTED - IGNORING');
            console.log('🔑 Message key:', messageKey);
            return null;
        }
        this.recentMessages.add(messageKey);
        console.log('✅ Message marked as processed:', messageKey);
        const callStack = new Error().stack;
        console.log('🔍 CALLED FROM:');
        console.log(callStack?.split('\n').slice(0, 4).join('\n'));
        const shouldNotify = payload.shouldNotify !== false;
        try {
            console.log('💾 Creating message in database...');
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
            console.log('✅ Message created successfully:', message.id);
            console.log('👤 Sender:', message.sender.username);
            console.log('🆔 Help ID:', message.helpId);
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