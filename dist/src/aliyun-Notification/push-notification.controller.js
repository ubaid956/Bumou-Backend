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
exports.PushNotificationController = void 0;
const common_1 = require("@nestjs/common");
const guard_1 = require("../auth/guard");
const push_notification_service_1 = require("./push-notification.service");
const decorator_1 = require("../decorator");
const notification_payload_dto_1 = require("./dto/notification-payload.dto");
let PushNotificationController = class PushNotificationController {
    constructor(pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }
    async sendPushNotification(userId, message, email) {
        const notificationPayload = {
            userIds: [userId],
            title: 'Test',
            subtitle: message,
            content: message,
            type: notification_payload_dto_1.NotificationType.GENERAL,
            data: {
                email: email,
            },
        };
        return await this.pushNotificationService.sendPushNotification(notificationPayload);
    }
};
exports.PushNotificationController = PushNotificationController;
__decorate([
    (0, common_1.Post)('/send'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)('message')),
    __param(2, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PushNotificationController.prototype, "sendPushNotification", null);
exports.PushNotificationController = PushNotificationController = __decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Controller)('push-notification'),
    __metadata("design:paramtypes", [push_notification_service_1.PushNotificationService])
], PushNotificationController);
//# sourceMappingURL=push-notification.controller.js.map