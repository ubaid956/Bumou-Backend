"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpModule = void 0;
const common_1 = require("@nestjs/common");
const otp_service_1 = require("./otp.service");
const otp_controller_1 = require("./otp.controller");
const sms_module_1 = require("../services/sms.module");
const auth_module_1 = require("../auth/auth.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
let OtpModule = class OtpModule {
};
exports.OtpModule = OtpModule;
exports.OtpModule = OtpModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.register({
                ttl: 5 * 60 * 1000,
                max: 100,
            }),
            sms_module_1.SmsModule,
            (0, common_2.forwardRef)(() => auth_module_1.AuthModule),
        ],
        providers: [otp_service_1.OtpService],
        controllers: [otp_controller_1.OtpController],
        exports: [otp_service_1.OtpService],
    })
], OtpModule);
//# sourceMappingURL=otp.module.js.map