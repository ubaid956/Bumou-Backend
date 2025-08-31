import { PrismaService } from 'src/prisma/prisma.service';
export declare class ChatService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    markMessageAsRead(userId: string, messageId: string, chatroomId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        chatroomId: string;
        messageId: string;
    }>;
}
