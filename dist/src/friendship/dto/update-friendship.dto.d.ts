import { FriendshipStatus } from "@prisma/client";
export declare class UpdateFriendshipDto {
    friendshipId: string;
    status: FriendshipStatus;
}
