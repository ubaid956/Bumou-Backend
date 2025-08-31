import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PushNotificationModule } from 'src/aliyun-Notification/push-notification.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PrismaModule, forwardRef(() => PushNotificationModule), UserModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule { }
