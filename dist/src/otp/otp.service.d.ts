import { SmsService } from '../services/sms.service';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
export declare class OtpService {
    private readonly smsService;
    private readonly configService;
    private cacheManager;
    private readonly logger;
    private readonly otpExpiration;
    constructor(smsService: SmsService, configService: ConfigService, cacheManager: Cache);
    private generateOtpCode;
    sendOtp(phoneNumber: string): Promise<{
        success: boolean;
        retryAfter?: number;
    }>;
    verifyOtp(phoneNumber: string, code: string): Promise<boolean>;
}
