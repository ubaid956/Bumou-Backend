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
exports.HelpController = void 0;
const common_1 = require("@nestjs/common");
const help_service_1 = require("./help.service");
const guard_1 = require("../auth/guard");
const decorator_1 = require("../decorator");
const dto_1 = require("./dto");
let HelpController = class HelpController {
    constructor(service) {
        this.service = service;
    }
    async askForHelp(id, payload) {
        return await this.service.askForHelp(id, payload);
    }
    async acceptHelp(userId, helpId) {
        return await this.service.acceptHelp(userId, helpId);
    }
    async deleteHelp(helpId) {
        return await this.service.deleteHelp(helpId);
    }
    async cancelHelp(helpId) {
        return await this.service.cancelHelp(helpId);
    }
    async getMyPendingHelpRequests(id) {
        return await this.service.getMyPendingHelpRequests(id);
    }
    async getOngoingHelp(id) {
        return await this.service.getOngoingHelp(id);
    }
    async getIncomingRequests(id) {
        return await this.service.getIncomingRequests(id);
    }
    async getHelpMessages(userId, helpId) {
        return await this.service.getHelpMessages(userId, helpId);
    }
    async markHelpMessageAsRead(userId, messageId) {
        return await this.service.markHelpMessageAsRead(userId, messageId);
    }
    async deleteHelpMessages(messageId, userId, user) {
        console.log('Controller deleteHelpMessages:', {
            messageId,
            userId,
            userType: typeof userId,
            userObject: user,
            userObjectId: user?.id,
            userObjectIdType: typeof user?.id
        });
        return await this.service.deleteHelpMessages(messageId, userId);
    }
    async markMessageAsRead(userId, messageId, chatroomId) {
        return this.service.markMessageAsRead(userId, messageId, chatroomId);
    }
};
exports.HelpController = HelpController;
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Post)('ask'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.NewHelpDto]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "askForHelp", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Put)('accept/:id'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "acceptHelp", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "deleteHelp", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Put)('cancel/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "cancelHelp", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('my-pending'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "getMyPendingHelpRequests", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('ongoing'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "getOngoingHelp", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('incoming-requests'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "getIncomingRequests", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('messages/:id'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "getHelpMessages", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Post)('messages/:messageId/mark-read'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "markHelpMessageAsRead", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Delete)('help_messages/delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorator_1.GetUser)('id')),
    __param(2, (0, decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "deleteHelpMessages", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Put)('mark-read/:chatroomId/:messageId'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('messageId')),
    __param(2, (0, common_1.Param)('chatroomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "markMessageAsRead", null);
exports.HelpController = HelpController = __decorate([
    (0, common_1.Controller)('help'),
    __metadata("design:paramtypes", [help_service_1.HelpService])
], HelpController);
//# sourceMappingURL=help.controller.js.map