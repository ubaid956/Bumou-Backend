import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class UserConnectionService {
    private prisma;
    constructor(prisma: PrismaService);
    logger: Logger;
    addSession(sessionId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        token: string;
    }>;
    getAllSessions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        token: string;
    }[]>;
    deleteSession(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        token: string;
    }>;
}
