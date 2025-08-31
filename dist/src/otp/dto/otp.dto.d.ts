export declare class SendOtpDto {
    phoneNumber: string;
}
export declare class VerifyOtpDto {
    phone: string;
    otp: string;
    Aliyun_token?: string;
    device_type?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    userType?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    schoolName?: string;
    className?: string;
    teacherName?: string;
    local?: string;
}
