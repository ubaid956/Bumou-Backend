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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const guard_1 = require("../auth/guard");
const decorator_1 = require("../decorator");
const chat_service_1 = require("./service/chat.service");
const message_service_1 = require("./service/message.service");
let ChatController = class ChatController {
    constructor(messageService, chatService) {
        this.messageService = messageService;
        this.chatService = chatService;
    }
    async getChatRooms(userId, page, pageSize) {
        const pageNumber = page ? parseInt(page, 10) || 1 : 1;
        const pageSizeNumber = pageSize ? parseInt(pageSize, 10) || 20 : 20;
        return this.messageService.getChatRoomsByUser(userId, pageNumber, pageSizeNumber);
    }
    async deleteMessage(messageId, userId) {
        return this.messageService.deleteMessage(messageId, userId);
    }
    async deleteChatRoom(chatroomId) {
        return this.messageService.deleteChatRoom(chatroomId);
    }
    async getMessages(chatroomId, userId, page = 1, pageSize = 20) {
        return this.messageService.getMessages(chatroomId, userId, page, pageSize);
    }
    async markMessageAsRead(userId, messageId, chatroomId) {
        return this.chatService.markMessageAsRead(userId, messageId, chatroomId);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('chatrooms'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatRooms", null);
__decorate([
    (0, common_1.Delete)('messages/:messageId'),
    __param(0, (0, common_1.Param)('messageId')),
    __param(1, (0, decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Delete)('chatrooms/:chatroomId'),
    __param(0, (0, common_1.Param)('chatroomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteChatRoom", null);
__decorate([
    (0, common_1.Get)('messages/:chatroomId'),
    __param(0, (0, common_1.Param)('chatroomId')),
    __param(1, (0, decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Query)('page', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('pageSize', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Put)('mark-read/:chatroomId/:messageId'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('messageId')),
    __param(2, (0, common_1.Param)('chatroomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markMessageAsRead", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [message_service_1.MessageService,
        chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map