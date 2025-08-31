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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const pop_core_1 = __importDefault(require("@alicloud/pop-core"));
let SmsService = SmsService_1 = class SmsService {
    constructor() {
        this.logger = new common_1.Logger(SmsService_1.name);
        this.client = new pop_core_1.default({
            accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
            accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
            endpoint: 'https://dysmsapi.aliyuncs.com',
            apiVersion: '2017-05-25',
        });
    }
    normalizePhoneNumber(phoneNumber) {
        if (phoneNumber.startsWith('+86')) {
            return phoneNumber.replace(/^\+86/, '');
        }
        return phoneNumber.replace(/^\+/, '');
    }
    async sendVerificationCode(phoneNumber, code) {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
        this.logger.warn(`DEBUG OTP for ${phoneNumber} (normalized: ${normalizedPhone}): ${code}`);
        const params = {
            RegionId: 'cn-hangzhou',
            PhoneNumbers: normalizedPhone,
            SignName: 'Bumou咘呣',
            TemplateCode: 'SMS_492420137',
            TemplateParam: JSON.stringify({ code }),
            Version: '2017-05-25',
            Action: 'SendSms',
        };
        const requestOption = { method: 'POST', timeout: 10000 };
        try {
            const result = await this.client.request('SendSms', params, requestOption);
            this.logger.debug(`Aliyun response: ${JSON.stringify(result)}`);
            if (result.Code === 'OK') {
                this.logger.log(`OTP sent successfully to ${phoneNumber}`);
                return true;
            }
            else {
                this.logger.error(`Failed to send OTP to ${phoneNumber}: ${result.Message}`);
                return false;
            }
        }
        catch (error) {
            this.logger.error(`Aliyun SMS error for ${phoneNumber}: ${error.message}`);
            return false;
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SmsService);
//# sourceMappingURL=sms.service.js.map