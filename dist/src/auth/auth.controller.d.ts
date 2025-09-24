import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { User } from '@prisma/client';
import { VerifyOtpDto } from './dto/otp.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<any>;
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
    register(registerDto: RegisterDto): Promise<{
        message: string;
        retryAfter: number;
        userDetials: RegisterDto;
    }>;
    getCurrentUser(user: User): Promise<{
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
    isUsernameAvailable(username: string): Promise<{
        isAvailable: boolean;
    }>;
    isEmailAvailable(email: string): Promise<{
        isAvailable: boolean;
    }>;
    isPhoneAvailable(phone: string): Promise<{
        isAvailable: boolean;
    }>;
    registerDevice(userId: string, body: {
        aliyunToken: string;
        deviceType: string;
        platform: string;
    }): Promise<void>;
}
