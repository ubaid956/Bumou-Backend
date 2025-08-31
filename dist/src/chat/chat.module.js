"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const user_module_1 = require("../user/user.module");
const chat_service_1 = require("./service/chat.service");
const user_connection_service_1 = require("./service/user-connection.service");
const message_service_1 = require("./service/message.service");
const chat_controller_1 = require("./chat.controller");
const push_notification_module_1 = require("../aliyun-Notification/push-notification.module");
const chat_gateway_1 = require("./gateway/chat.gateway");
const help_chat_service_1 = require("./service/help-chat.service");
const help_module_1 = require("../help/help.module");
const shared_module_1 = require("../shared/shared.module");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            push_notification_module_1.PushNotificationModule,
            (0, common_1.forwardRef)(() => help_module_1.HelpModule),
            shared_module_1.SharedModule,
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [
            chat_service_1.ChatService,
            help_chat_service_1.HelpChatService,
            user_connection_service_1.UserConnectionService,
            message_service_1.MessageService,
            chat_gateway_1.ChatGateway,
        ],
        exports: [
            user_connection_service_1.UserConnectionService,
            message_service_1.MessageService,
            chat_service_1.ChatService,
            help_chat_service_1.HelpChatService,
            chat_gateway_1.ChatGateway,
        ],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map