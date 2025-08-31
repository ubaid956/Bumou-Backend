"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationModule = void 0;
const common_1 = require("@nestjs/common");
const push_notification_controller_1 = require("./push-notification.controller");
const push_notification_service_1 = require("./push-notification.service");
const push_notification_comment_service_1 = require("./push-notification-comment.service");
const user_module_1 = require("../user/user.module");
const notifications_module_1 = require("../notifications/notifications.module");
const aliyun_push_service_1 = require("./aliyun-push.service");
let PushNotificationModule = class PushNotificationModule {
};
exports.PushNotificationModule = PushNotificationModule;
exports.PushNotificationModule = PushNotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            (0, common_1.forwardRef)(() => notifications_module_1.NotificationsModule),
        ],
        controllers: [push_notification_controller_1.PushNotificationController],
        providers: [
            push_notification_service_1.PushNotificationService,
            push_notification_comment_service_1.PushNotificationCommentService,
            aliyun_push_service_1.AliyunPushService
        ],
        exports: [push_notification_service_1.PushNotificationService, push_notification_comment_service_1.PushNotificationCommentService],
    })
], PushNotificationModule);
//# sourceMappingURL=push-notification.module.js.map