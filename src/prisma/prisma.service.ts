import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: "postgresql://postgres:bumou1122@52.83.149.136:5432/bumou?schema=public",
        },
      },
    });

    this.$connect()
      .then(() => {
        this.logger.log('Connected to the database');
      })
      .catch((error) => {
        this.logger.error(`Error connecting to the database: ${error.message}`);
      });
  }
  async onModuleDestroy() {
    console.log('disconnected from database');
    await this.$disconnect();
  }
}
