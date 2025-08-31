// src/otp/otp.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { SmsService } from '../services/sms.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpExpiration: number;

  constructor(
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.otpExpiration =
      this.configService.get<number>('OTP_EXPIRATION_MINUTES', 5) * 60 * 1000;
  }

  private generateOtpCode(length = 6): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  async sendOtp(
    phoneNumber: string,
  ): Promise<{ success: boolean; retryAfter?: number }> {
    try {
      const normalizedPhone = phoneNumber.replace(/\D/g, ''); // remove non-digits

      const existingOtp = await this.cacheManager.get<string>(
        `otp:${normalizedPhone}`,
      );
      if (existingOtp) {
        const ttl = await (this.cacheManager as any).store.ttl(
          `otp:${normalizedPhone}`,
        );
        return { success: false, retryAfter: ttl };
      }

      const code = this.generateOtpCode();
      this.logger.warn(`DEBUG OTP for ${normalizedPhone}: ${code}`);

      const success = await this.smsService.sendVerificationCode(
        normalizedPhone,
        code,
      );

      if (success) {
        await this.cacheManager.set(
          `otp:${normalizedPhone}`,
          code,
          this.otpExpiration,
        );
        this.logger.log(
          `Stored OTP for ${normalizedPhone} in cache: ${code} (TTL: ${this.otpExpiration}ms)`,
        );
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      this.logger.error(`Error sending OTP: ${error.message}`);
      return { success: false };
    }
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const normalizedPhone = phoneNumber.replace(/\D/g, ''); // remove non-digits

      const storedCode = await this.cacheManager.get<string>(
        `otp:${normalizedPhone}`,
      );
      this.logger.warn(
        `Verifying OTP for ${normalizedPhone} → Provided: ${code}, Stored: ${storedCode}`,
      );

      if (storedCode === code) {
        await this.cacheManager.del(`otp:${normalizedPhone}`);
        this.logger.log(`OTP verified successfully for ${normalizedPhone}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error verifying OTP: ${error.message}`);
      return false;
    }
  }

}
