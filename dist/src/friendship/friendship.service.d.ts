import { AddFriendDto, SearchFriendsDto, UpdateFriendshipDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { PushNotificationService } from 'src/aliyun-Notification/push-notification.service';
import { UserService } from 'src/user/user.service';
export declare class FriendshipService {
    private prisma;
    private readonly i18n;
    private readonly pushNotificationService;
    private readonly userService;
    constructor(prisma: PrismaService, i18n: I18nService, pushNotificationService: PushNotificationService, userService: UserService);
    removeFriend(user: User, friendId: string): Promise<{
        message: string;
    }>;
    getFriendships(userId: string): Promise<{
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
        friendshipId: string;
    }[]>;
    getPendingFriendship(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        user1Id: string;
        user2Id: string;
    }[]>;
    acceptFriendship(user: User, request: UpdateFriendshipDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        user1Id: string;
        user2Id: string;
    } | {
        message: string;
    }>;
    addFriend(userData: User, addFriendDto: AddFriendDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        user1Id: string;
        user2Id: string;
    }>;
    getFriendSuggestions(user: User, page: number, pageSize: number): Promise<{
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
    }[]>;
    searchFriends(userId: string, searchDto: SearchFriendsDto): Promise<{
        data: {
            friendshipId: string;
            id: string;
            email: string;
            username: string;
            createdAt: Date;
            updatedAt: Date;
            userType: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            profilePicture: string;
        }[];
        meta: {
            totalCount: number;
            page: number;
            pageSize: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
}
