import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient {
    private readonly logger;
    constructor(config: ConfigService);
    onModuleDestroy(): Promise<void>;
}
