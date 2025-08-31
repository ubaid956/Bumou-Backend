"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MomentsModule = void 0;
const common_1 = require("@nestjs/common");
const moments_controller_1 = require("./moments.controller");
const moments_service_1 = require("./moments.service");
const push_notification_module_1 = require("../aliyun-Notification/push-notification.module");
const chat_module_1 = require("../chat/chat.module");
let MomentsModule = class MomentsModule {
};
exports.MomentsModule = MomentsModule;
exports.MomentsModule = MomentsModule = __decorate([
    (0, common_1.Module)({
        imports: [push_notification_module_1.PushNotificationModule, (0, common_1.forwardRef)(() => chat_module_1.ChatModule)],
        controllers: [moments_controller_1.MomentsController],
        providers: [moments_service_1.MomentsService],
        exports: [moments_service_1.MomentsService]
    })
], MomentsModule);
//# sourceMappingURL=moments.module.js.map