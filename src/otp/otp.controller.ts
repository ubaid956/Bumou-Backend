import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/otp.dto';
import { VerifyOtpDto } from 'src/auth/dto/otp.dto';
import { AuthService } from '../auth/auth.service'; // Import AuthService to use verifyOtp method

@Controller('auth/otp')  // This creates /auth/otp base path
export class OtpController {
  constructor(private readonly otpService: OtpService, private readonly authService: AuthService) { }

  @Post('send')
  @HttpCode(200)
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.otpService.sendOtp(sendOtpDto.phoneNumber);
  }

  @Post('verify-otp')
  @HttpCode(200)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(
      verifyOtpDto.phone,
      verifyOtpDto.otp,
      verifyOtpDto, // <-- this is VerifyOtpDto, NOT LoginDto
    );
  }

}