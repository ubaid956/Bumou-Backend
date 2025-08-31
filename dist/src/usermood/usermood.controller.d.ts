import { UsermoodService } from './usermood.service';
import { AddUsermoodDto } from './dto/add-usermood.dto';
export declare class UsermoodController {
    private usermoodService;
    constructor(usermoodService: UsermoodService);
    create(userId: string, payload: AddUsermoodDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mood: import(".prisma/client").$Enums.UserMoodType;
        note: string | null;
    }>;
    moodPercentOfDays(userId: string, previousDaysOf?: number): Promise<{
        mood: "VERYGOOD" | "GOOD" | "BAD" | "VERYBAD" | "NEUTRAL";
        percentage: number;
    }[]>;
}
