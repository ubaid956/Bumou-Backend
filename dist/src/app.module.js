"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const prisma_module_1 = require("./prisma/prisma.module");
const config_1 = require("@nestjs/config");
const usermood_module_1 = require("./usermood/usermood.module");
const friendship_module_1 = require("./friendship/friendship.module");
const chat_module_1 = require("./chat/chat.module");
const moments_module_1 = require("./moments/moments.module");
const upload_module_1 = require("./upload/upload.module");
const sms_module_1 = require("./services/sms.module");
const push_notification_module_1 = require("./aliyun-Notification/push-notification.module");
const nestjs_i18n_1 = require("nestjs-i18n");
const bumou_module_1 = require("./bumou/bumou.module");
const help_module_1 = require("./help/help.module");
const shared_module_1 = require("./shared/shared.module");
const path = __importStar(require("path"));
const otp_module_1 = require("./otp/otp.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env'],
            }),
            nestjs_i18n_1.I18nModule.forRoot({
                fallbackLanguage: 'zh',
                fallbacks: { en: 'en_US', zh: 'zh_CN' },
                loaderOptions: {
                    path: path.join(__dirname, '/i18n/'),
                    watch: true,
                },
                logging: true,
                disableMiddleware: false,
                resolvers: [
                    new nestjs_i18n_1.HeaderResolver(['x-lang', 'lang', 'locale']),
                    nestjs_i18n_1.AcceptLanguageResolver,
                ],
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            prisma_module_1.PrismaModule,
            usermood_module_1.UsermoodModule,
            friendship_module_1.FriendshipModule,
            chat_module_1.ChatModule,
            moments_module_1.MomentsModule,
            upload_module_1.UploadModule,
            push_notification_module_1.PushNotificationModule,
            bumou_module_1.BumouModule,
            help_module_1.HelpModule,
            shared_module_1.SharedModule,
            otp_module_1.OtpModule,
            sms_module_1.SmsModule
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map