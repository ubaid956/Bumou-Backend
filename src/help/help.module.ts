import { forwardRef, Module } from '@nestjs/common';
import { HelpController } from './help.controller';
import { HelpService } from './help.service';
import { PushNotificationModule } from 'src/aliyun-Notification/push-notification.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ChatModule } from 'src/chat/chat.module';
import { MessageService } from 'src/chat/service/message.service';
import { HelpChatService } from 'src/chat/service/help-chat.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    PushNotificationModule,
    AuthModule,
    UserModule,
    forwardRef(() => ChatModule),
    SharedModule
  ],
  controllers: [HelpController],
  providers: [
    HelpService,
    MessageService,
    HelpChatService,
  ],
  exports: [HelpService],
})
export class HelpModule { }
