"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const chat_module_1 = require("../chat/chat.module");
const websocket_exception_filter_1 = require("../chat/filter/websocket-exception.filter");
const chat_gateway_1 = require("../chat/gateway/chat.gateway");
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, (0, common_1.forwardRef)(() => chat_module_1.ChatModule)],
        providers: [chat_gateway_1.ChatGateway, websocket_exception_filter_1.WebSocketExceptionFilter],
        exports: [chat_gateway_1.ChatGateway],
    })
], SharedModule);
//# sourceMappingURL=shared.module.js.map