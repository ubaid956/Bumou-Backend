import { Module, forwardRef } from '@nestjs/common';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationCommentService } from './push-notification-comment.service';
import { UserModule } from 'src/user/user.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AliyunPushService } from './aliyun-push.service';

@Module({
    imports: [
        UserModule,
        forwardRef(() => NotificationsModule),
        // Remove OneSignal module since we're using Aliyun
    ],
    controllers: [PushNotificationController],
    providers: [
        PushNotificationService,
        PushNotificationCommentService,
        AliyunPushService
    ],
    exports: [PushNotificationService, PushNotificationCommentService],
})
export class PushNotificationModule { }