import { UserType } from '../../enum';
export declare class VerifyOtpDto {
    phone: string;
    otp: string;
    Aliyun_token?: string;
    device_type?: string;
    userType?: UserType;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    schoolName?: string;
    className?: string;
    teacherName?: string;
    local?: string;
}
