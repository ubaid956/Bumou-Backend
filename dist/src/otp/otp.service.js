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
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const sms_service_1 = require("../services/sms.service");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
let OtpService = OtpService_1 = class OtpService {
    constructor(smsService, configService, cacheManager) {
        this.smsService = smsService;
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(OtpService_1.name);
        this.otpExpiration =
            this.configService.get('OTP_EXPIRATION_MINUTES', 5) * 60 * 1000;
    }
    generateOtpCode(length = 6) {
        const digits = '0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += digits.charAt(Math.floor(Math.random() * digits.length));
        }
        return code;
    }
    async sendOtp(phoneNumber) {
        try {
            const normalizedPhone = phoneNumber.replace(/\D/g, '');
            const existingOtp = await this.cacheManager.get(`otp:${normalizedPhone}`);
            if (existingOtp) {
                const ttl = await this.cacheManager.store.ttl(`otp:${normalizedPhone}`);
                return { success: false, retryAfter: ttl };
            }
            const code = this.generateOtpCode();
            this.logger.warn(`DEBUG OTP for ${normalizedPhone}: ${code}`);
            const success = await this.smsService.sendVerificationCode(normalizedPhone, code);
            if (success) {
                await this.cacheManager.set(`otp:${normalizedPhone}`, code, this.otpExpiration);
                this.logger.log(`Stored OTP for ${normalizedPhone} in cache: ${code} (TTL: ${this.otpExpiration}ms)`);
                return { success: true };
            }
            return { success: false };
        }
        catch (error) {
            this.logger.error(`Error sending OTP: ${error.message}`);
            return { success: false };
        }
    }
    async verifyOtp(phoneNumber, code) {
        try {
            const normalizedPhone = phoneNumber.replace(/\D/g, '');
            const storedCode = await this.cacheManager.get(`otp:${normalizedPhone}`);
            this.logger.warn(`Verifying OTP for ${normalizedPhone} → Provided: ${code}, Stored: ${storedCode}`);
            if (storedCode === code) {
                await this.cacheManager.del(`otp:${normalizedPhone}`);
                this.logger.log(`OTP verified successfully for ${normalizedPhone}`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Error verifying OTP: ${error.message}`);
            return false;
        }
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [sms_service_1.SmsService,
        config_1.ConfigService, Object])
], OtpService);
//# sourceMappingURL=otp.service.js.map