import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/otp.dto';
import { VerifyOtpDto } from 'src/auth/dto/otp.dto';
import { AuthService } from '../auth/auth.service';
export declare class OtpController {
    private readonly otpService;
    private readonly authService;
    constructor(otpService: OtpService, authService: AuthService);
    sendOtp(sendOtpDto: SendOtpDto): Promise<{
        success: boolean;
        retryAfter?: number;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        access_token: string;
        id: string;
        email: string;
        username: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        password: string;
        userType: import(".prisma/client").$Enums.UserType;
        local: string | null;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zip: string | null;
        country: string | null;
        schoolName: string | null;
        className: string | null;
        teacherName: string | null;
        isVerified: boolean;
        isBlocked: boolean;
        isOnline: boolean;
        isDeleted: boolean;
        isHelping: boolean;
        Aliyun_token: string | null;
        device_type: string | null;
    }>;
}
