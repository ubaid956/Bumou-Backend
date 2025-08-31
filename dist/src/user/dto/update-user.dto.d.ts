import { UserType } from "@prisma/client";
export declare class UpdateUserDto {
    userType?: UserType;
    firstName?: string;
    lastName?: string;
    username?: string;
    profilePicture?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    schoolName?: string;
    className?: string;
    teacherName?: string;
    local?: string;
}
