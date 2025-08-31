import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;
}


// export class VerifyOtpDto {
//   @IsNotEmpty()
//   @IsPhoneNumber()
//   phoneNumber: string;

//   @IsNotEmpty()
//   @IsString()
//   @Length(6, 6)
//   code: string;
// }


import { IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  phone: string; // ✅ standardized

  @IsString()
  @IsNotEmpty()
  otp: string; // ✅ standardized

  @IsOptional()
  @IsString()
  Aliyun_token?: string;

  @IsOptional()
  @IsString()
  device_type?: string;

  // Optional fields for user registration (if user not found)
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  userType?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsString()
  className?: string;

  @IsOptional()
  @IsString()
  teacherName?: string;

  @IsOptional()
  @IsString()
  local?: string;
}
