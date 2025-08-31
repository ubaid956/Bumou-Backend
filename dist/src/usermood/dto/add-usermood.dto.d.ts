import { UserMoodType } from "@prisma/client";
export declare class AddUsermoodDto {
    mood: UserMoodType;
    note?: string;
}
