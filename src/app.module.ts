import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsermoodModule } from './usermood/usermood.module';
import { FriendshipModule } from './friendship/friendship.module';
import { ChatModule } from './chat/chat.module';
import { MomentsModule } from './moments/moments.module';
import { UploadModule } from './upload/upload.module';
import { SmsModule } from 'src/services/sms.module';
// import { PushNotificationModule } from './push-notification/push-notification.module';
import { PushNotificationModule } from './aliyun-Notification/push-notification.module';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
} from 'nestjs-i18n';
import { BumouModule } from './bumou/bumou.module';
import { HelpModule } from './help/help.module';
import { SharedModule } from './shared/shared.module';
import * as path from 'path';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'zh',
      fallbacks: { en: 'en_US', zh: 'zh_CN' },
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      logging: true,
      disableMiddleware: false,
      resolvers: [
        new HeaderResolver(['x-lang', 'lang', 'locale']),
        AcceptLanguageResolver,
      ],
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    UsermoodModule,
    FriendshipModule,
    ChatModule,
    MomentsModule,
    UploadModule,
    PushNotificationModule,
    BumouModule,
    HelpModule,
    SharedModule,
    OtpModule,
    SmsModule
  ],
})
export class AppModule { }
