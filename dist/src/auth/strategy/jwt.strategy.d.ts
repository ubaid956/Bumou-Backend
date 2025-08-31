import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
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
export {};
