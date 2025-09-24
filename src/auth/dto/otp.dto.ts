// import { IsNotEmpty, IsString } from 'class-validator';

// export class VerifyOtpDto {
//     @IsString()
//     @IsNotEmpty()
//     phoneNumber: string;

//     @IsString()
//     @IsNotEmpty()
//     code: string;

//     @IsString()
//     Aliyun_token?: string;

//     @IsString()
//     device_type?: string;
// }


import { IsNotEmpty, IsOptional, IsString, IsEmail, Matches } from 'class-validator';
import { UserType } from '../../enum';

export class VerifyOtpDto {
  // OTP fields
  @IsString()
  @IsNotEmpty()
  phone: string;   // 🔑 match your AuthService parameter

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsOptional()
  Aliyun_token?: string;

  @IsString()
  @IsOptional()
  device_type?: string;

  // Registration fields (needed if it's a new user)
  @Matches(/^(STUDENT|ADULT)$/)
  @IsOptional()
  userType?: UserType;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  schoolName?: string;

  @IsString()
  @IsOptional()
  className?: string;

  @IsString()
  @IsOptional()
  teacherName?: string;

  @IsString()
  @IsOptional()
  local?: string;

  // Optional password to set on user creation via OTP verification
  @IsOptional()
  @IsString()
  password?: string;
}
