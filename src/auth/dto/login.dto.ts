import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches } from 'class-validator';
import { UserType } from '../../enum';

export class LoginDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phonenumber: string;


  @Matches(/^(STUDENT|ADULT)$/)
  userType: UserType;


  @IsOptional()
  device_type?: any;

  @IsOptional()
  Aliyun_token?: any;
}
