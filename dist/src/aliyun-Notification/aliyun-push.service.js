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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AliyunPushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliyunPushService = void 0;
const common_1 = require("@nestjs/common");
const $OpenApi = __importStar(require("@alicloud/openapi-client"));
const $Push20160801 = __importStar(require("@alicloud/push20160801"));
const $Util = __importStar(require("@alicloud/tea-util"));
let AliyunPushService = AliyunPushService_1 = class AliyunPushService {
    constructor() {
        this.logger = new common_1.Logger(AliyunPushService_1.name);
        this.initializeClient();
    }
    initializeClient() {
        const config = new $OpenApi.Config({
            accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
            accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
            endpoint: 'cloudpush.aliyuncs.com',
        });
        this.client = new $Push20160801.default(config);
    }
    async pushToAndroid(params) {
        try {
            const pushRequest = new $Push20160801.PushRequest({
                appKey: params.appKey || 334974694,
                deviceType: 'ANDROID',
                target: 'DEVICE',
                targetValue: params.deviceToken,
                title: params.title,
                body: params.content,
                pushType: 'NOTICE',
                androidNotifyType: 'BOTH',
                androidOpenType: 'APPLICATION',
                androidPopupActivity: 'app.bumoumobile.com.MainActivity',
                androidPopupTitle: params.title,
                androidPopupBody: params.content,
                storeOffline: true,
                androidNotificationChannel: 'bumou',
                androidNotificationHonorChannel: 'LOW',
                androidNotificationXiaomiChannel: '132457',
                androidMessageOppoNotifyLevel: 2,
                androidMessageHuaweiCategory: 'VOIP',
                androidMessageOppoCategory: 'MARKETING',
                androidMessageVivoCategory: 'MARKETING',
                androidHuaweiTargetUserType: 0,
                androidHonorTargetUserType: 0,
                androidVivoPushMode: 0,
                androidBadgeClass: 'app.bumoumobile.com.MainActivity',
                ...(params.data && { androidExtParameters: JSON.stringify(params.data) })
            });
            const runtime = new $Util.RuntimeOptions({});
            const response = await this.client.pushWithOptions(pushRequest, runtime);
            this.logger.log(`Android push successful`);
            return response;
        }
        catch (error) {
            this.logger.error(`Android push failed: ${error.message}`);
            throw error;
        }
    }
    async pushToIOS(params) {
        try {
            const pushRequest = new $Push20160801.PushRequest({
                appKey: params.appKey || 335278915,
                deviceType: 'iOS',
                target: 'DEVICE',
                targetValue: params.deviceToken,
                title: params.title,
                body: params.content,
                pushType: 'NOTICE',
                iOSApnsEnv: 'PRODUCT',
                iOSBadge: 1,
                iOSBadgeAutoIncrement: true,
                iOSMutableContent: true,
                iOSExtParameters: params.data ? JSON.stringify(params.data) : undefined,
            });
            const runtime = new $Util.RuntimeOptions({});
            const response = await this.client.pushWithOptions(pushRequest, runtime);
            this.logger.log(`iOS push successful`);
            return response;
        }
        catch (error) {
            this.logger.error(`iOS push failed: ${error.message}`);
            throw error;
        }
    }
    async pushToUser(params) {
        try {
            const pushRequest = new $Push20160801.PushRequest({
                appKey: params.appKey || 334974694,
                target: 'ACCOUNT',
                targetValue: params.userId,
                title: params.title,
                body: params.content,
                pushType: 'NOTICE',
                androidNotifyType: 'BOTH',
                androidOpenType: 'APPLICATION',
                storeOffline: true,
                iOSApnsEnv: 'PRODUCT',
                iOSBadgeAutoIncrement: true,
                ...(params.data && { androidExtParameters: JSON.stringify(params.data) }),
                ...(params.data && { iOSExtParameters: JSON.stringify(params.data) })
            });
            const runtime = new $Util.RuntimeOptions({});
            const response = await this.client.pushWithOptions(pushRequest, runtime);
            this.logger.log(`User push successful`);
            return response;
        }
        catch (error) {
            this.logger.error(`User push failed: ${error.message}`);
            throw error;
        }
    }
};
exports.AliyunPushService = AliyunPushService;
exports.AliyunPushService = AliyunPushService = AliyunPushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AliyunPushService);
//# sourceMappingURL=aliyun-push.service.js.map