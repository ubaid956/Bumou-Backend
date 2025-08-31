import { forwardRef, Module } from '@nestjs/common';
import { MomentsController } from './moments.controller';
import { MomentsService } from './moments.service';
import { PushNotificationModule } from 'src/aliyun-Notification/push-notification.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [PushNotificationModule, forwardRef(() => ChatModule)],
  controllers: [MomentsController],
  providers: [MomentsService],
  exports: [MomentsService]
})
export class MomentsModule { }
