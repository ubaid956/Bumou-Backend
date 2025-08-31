import { PrismaService } from 'src/prisma/prisma.service';
import { AddUsermoodDto } from './dto/add-usermood.dto';
import { MomentsService } from 'src/moments/moments.service';
import { I18nService } from 'nestjs-i18n';
export declare class UsermoodService {
    private prisma;
    private momentService;
    private readonly i18n;
    constructor(prisma: PrismaService, momentService: MomentsService, i18n: I18nService);
    create(userId: string, payload: AddUsermoodDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mood: import(".prisma/client").$Enums.UserMoodType;
        note: string | null;
    }>;
    moodPercentOfDays(userId: string, previousDaysOf: number): Promise<{
        mood: "VERYGOOD" | "GOOD" | "BAD" | "VERYBAD" | "NEUTRAL";
        percentage: number;
    }[]>;
}
