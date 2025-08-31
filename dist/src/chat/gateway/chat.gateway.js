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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const auth_service_1 = require("../../auth/auth.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const dto_1 = require("../dto");
const message_service_1 = require("../service/message.service");
const client_1 = require("@prisma/client");
const help_chat_service_1 = require("../service/help-chat.service");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    constructor(authService, messageService, prisma, helpChatService) {
        this.authService = authService;
        this.messageService = messageService;
        this.prisma = prisma;
        this.helpChatService = helpChatService;
    }
    async onModuleInit() {
        console.log('Socket server is running');
    }
    emitHelpRequest(payload) {
        this.server.emit(ChatGateway_1.helpRequestEvent, payload);
    }
    emitHelpRequestRemove(helpId) {
        this.server.emit(ChatGateway_1.helpRequestRemoveEvent, helpId);
    }
    emitHelpMessage(payload, userIds) {
        this.server
            .to(userIds)
            .emit(ChatGateway_1.helpMessageEvent, payload);
    }
    emitCommentNotification(payload, userId) {
        this.server
            .to(userId)
            .emit(ChatGateway_1.commentNotificationEvent, payload);
    }
    emitMessageDeleted(messageId, chatroomId) {
        this.server.emit('message-deleted', { messageId, chatroomId });
    }
    async handleConnection(socket) {
        try {
            const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
            const userId = decodedToken.sub;
            if (!userId) {
                throw new Error('Invalid User ID');
            }
            console.log('User: ' + userId + ' connected with ID: ' + socket.id);
            socket.join(userId);
            this.server
                .to(socket.id)
                .emit(ChatGateway_1.connectionEvent, { message: 'Connected' });
            this.addUserSession(socket.id, userId);
            console.log('Connected: ', socket.id);
        }
        catch (error) {
            console.log('Socket Connection Exception: ', error);
            this.server
                .to(socket.id)
                .emit(ChatGateway_1.connectionEvent, { error: error.message });
            socket.disconnect();
        }
    }
    async handleDeleteMessage(client, data) {
        const { messageId } = data;
        const message = await this.messageService.deleteMessage(messageId, client.id);
        if (message) {
            this.server.to(message.chatroomId).emit('delete-message', { messageId });
        }
    }
    async addUserSession(sessionId, userId) {
        try {
            await this.prisma.userSession.create({
                data: {
                    id: sessionId.toString(),
                    token: sessionId,
                    userId,
                },
            });
            await this.prisma.user.update({
                where: { id: userId },
                data: { isOnline: true },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    console.log('User is already online');
                    return;
                }
            }
        }
    }
    async deleteUserSession(sessionId) {
        const session = await this.prisma.userSession.findFirst({
            where: { token: sessionId },
        });
        if (!session) {
            return;
        }
        await this.prisma.userSession.delete({ where: { id: session.id } });
        this.prisma.userSession
            .aggregate({
            where: {
                userId: session.userId,
            },
            _count: true,
        })
            .then((count) => {
            if (count._count === 0) {
                this.prisma.user.update({
                    where: { id: session.userId },
                    data: { isOnline: false },
                });
            }
        });
        return session;
    }
    async handleDisconnect(client) {
        try {
            const session = await this.deleteUserSession(client.id);
            if (session) {
                console.log('User Left with ID: ', session.userId);
                client.leave(session.userId);
            }
            this.server.to(client.id).emit('You have been disconnected');
            console.log('Diconnected: ', client.id);
        }
        catch (error) {
            console.log('Socket Disconnection Exception: ', error);
        }
    }
    async handleMessage(client, message) {
        if (!message) {
            return;
        }
        const success = true;
        client.emit('acknowledge', { success });
        const response = await this.messageService.onNewMessage(message);
        this.server
            .to([message.senderId, message.receiverId])
            .emit(ChatGateway_1.chatEvent, response);
    }
    async handleHelpMessage(client, payload) {
        try {
            if (!payload ||
                !payload.message ||
                !payload.senderId ||
                !payload.helpId) {
                console.log('Invalid help message payload: ', payload);
                return;
            }
            const success = true;
            client.emit('acknowledge', { success });
            const response = await this.helpChatService.handleNewHelpMessage(payload);
            const senderId = response.help.helper.id;
            const receiverId = response.help.requestedBy.id;
            this.emitHelpMessage(response, [senderId, receiverId]);
        }
        catch (error) {
            console.log('Error handling help message: ', error);
        }
    }
    async handleHelpRequestEvent(client, payload) { }
    async handleHelpMessageEvent(client, payload) { }
    async handleMakeCall(client, data) {
        try {
            console.log("calling");
            console.log(data);
            this.validateCallPayload(data);
            const callId = this.generateCallId(data.senderId, data.receiverId);
            this.server.to(data.receiverId).emit('newCall', data);
        }
        catch (error) {
            console.log("error");
        }
    }
    async handleAnswerCall(client, data) {
        try {
            this.validateCallPayload(data);
            const callId = this.generateCallId(data.senderId, data.receiverId);
            this.server.to(data.receiverId).emit('answerCall', data);
        }
        catch (error) { }
    }
    async handleEndCall(client, data) {
        try {
            this.validateCallPayload(data);
            const callId = this.generateCallId(data.senderId, data.receiverId);
            this.server.to(data.receiverId).emit('endCall', data);
        }
        catch (error) { }
    }
    handleIceCandidate(client, data) {
        try {
            this.validateCallPayload(data);
            this.server.to(data.receiverId).emit('signal', data);
        }
        catch (error) { }
    }
    generateCallId(callerId, receiverId) {
        const ids = [callerId, receiverId];
        ids.sort();
        return ids.join('_');
    }
    validateCallPayload(data) {
        if (!data ||
            !data.senderId ||
            !data.receiverId ||
            !data.payload ||
            !data.type) {
            return data;
        }
        else {
            throw new Error('Invalid Call Payload');
        }
    }
};
exports.ChatGateway = ChatGateway;
ChatGateway.connectionEvent = 'connection';
ChatGateway.chatEvent = 'chat';
ChatGateway.newMessageEvent = 'new-message';
ChatGateway.helpRequestEvent = 'help-request';
ChatGateway.helpRequestRemoveEvent = 'help-request-remove';
ChatGateway.helpMessageEvent = 'help-message';
ChatGateway.commentNotificationEvent = 'comment-notification';
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete-message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(ChatGateway.newMessageEvent),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, dto_1.ChatMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(ChatGateway.helpMessageEvent),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleHelpMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(ChatGateway.helpRequestEvent),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleHelpRequestEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(ChatGateway.helpMessageEvent),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleHelpMessageEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('newCall'),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, dto_1.CallDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMakeCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('answerCall'),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, dto_1.CallDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleAnswerCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('endCall'),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, dto_1.CallDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleEndCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('signal'),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, dto_1.CallDto]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleIceCandidate", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        message_service_1.MessageService,
        prisma_service_1.PrismaService,
        help_chat_service_1.HelpChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map