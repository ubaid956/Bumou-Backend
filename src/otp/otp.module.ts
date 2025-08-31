import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { SmsModule } from '../services/sms.module';
import { AuthModule } from 'src/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { forwardRef } from '@nestjs/common';


@Module({
  imports: [
    CacheModule.register({
      ttl: 5 * 60 * 1000, // 5 minutes
      max: 100,
    }),
    SmsModule,
    forwardRef(() => AuthModule), // <-- forwardRef to avoid circular dependency

  ],
  providers: [OtpService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule { }