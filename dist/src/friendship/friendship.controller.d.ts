import { FriendshipService } from './friendship.service';
import { AddFriendDto, SearchFriendsDto } from './dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { User } from '@prisma/client';
export declare class FriendshipController {
    private friendshipService;
    constructor(friendshipService: FriendshipService);
    addFriend(user: User, addFriendDto: AddFriendDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        user1Id: string;
        user2Id: string;
    }>;
    getPendingFriendship(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        user1Id: string;
        user2Id: string;
    }[]>;
    getFriendSuggestions(user: User, page?: number, pageSize?: number): Promise<{
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
    acceptFriendship(user: User, body: UpdateFriendshipDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FriendshipStatus;
        user1Id: string;
        user2Id: string;
    } | {
        message: string;
    }>;
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
