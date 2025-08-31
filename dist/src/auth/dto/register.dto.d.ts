import { UserType } from '../../enum';
export declare class RegisterDto {
    userType: UserType;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    address?: string;
    city: string;
    state?: string;
    country: string;
    schoolName?: string;
    className?: string;
    teacherName?: string;
    local?: string;
    device_type?: any;
    Aliyun_token?: string;
}
