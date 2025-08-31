import { Injectable, Logger } from '@nestjs/common';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Push20160801 from '@alicloud/push20160801';
import * as $Util from '@alicloud/tea-util';

@Injectable()
export class AliyunPushService {
    private readonly logger = new Logger(AliyunPushService.name);
    private client: any;

    constructor() {
        this.initializeClient();
    }

    private initializeClient() {
        const config = new $OpenApi.Config({
            accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
            accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
            endpoint: 'cloudpush.aliyuncs.com',
        });

        this.client = new $Push20160801.default(config);
    }

    async pushToAndroid(params: {
        deviceToken: string;
        title: string;
        content: string;
        data?: any;
        appKey?: number;
    }) {
        try {
            const pushRequest = new ($Push20160801 as any).PushRequest({
                appKey: params.appKey || 334974694,
                deviceType: 'ANDROID',
                target: 'DEVICE',
                targetValue: params.deviceToken,
                title: params.title,
                body: params.content,
                pushType: 'NOTICE',
                androidNotifyType: 'BOTH',
                androidOpenType: 'APPLICATION',
                androidPopupActivity: 'app.bumoumobile.com.MainActivity',
                androidPopupTitle: params.title,
                androidPopupBody: params.content,
                storeOffline: true,
                androidNotificationChannel: 'bumou',
                androidNotificationHonorChannel: 'LOW',
                androidNotificationXiaomiChannel: '132457',
                androidMessageOppoNotifyLevel: 2,
                androidMessageHuaweiCategory: 'VOIP',
                androidMessageOppoCategory: 'MARKETING',
                androidMessageVivoCategory: 'MARKETING',
                androidHuaweiTargetUserType: 0,
                androidHonorTargetUserType: 0,
                androidVivoPushMode: 0,
                androidBadgeClass: 'app.bumoumobile.com.MainActivity',
                ...(params.data && { androidExtParameters: JSON.stringify(params.data) })
            });

            const runtime = new ($Util as any).RuntimeOptions({});
            const response = await this.client.pushWithOptions(pushRequest, runtime);

            this.logger.log(`Android push successful`);
            return response;
        } catch (error) {
            this.logger.error(`Android push failed: ${error.message}`);
            throw error;
        }
    }

    async pushToIOS(params: {
        deviceToken: string;
        title: string;
        content: string;
        data?: any;
        appKey?: number;
    }) {
        try {
            const pushRequest = new ($Push20160801 as any).PushRequest({
                appKey: params.appKey || 335278915,
                deviceType: 'iOS',
                target: 'DEVICE',
                targetValue: params.deviceToken,
                title: params.title,
                body: params.content,
                pushType: 'NOTICE',
                iOSApnsEnv: 'PRODUCT',
                iOSBadge: 1,
                iOSBadgeAutoIncrement: true,
                iOSMutableContent: true,
                iOSExtParameters: params.data ? JSON.stringify(params.data) : undefined,
            });

            const runtime = new ($Util as any).RuntimeOptions({});
            const response = await this.client.pushWithOptions(pushRequest, runtime);

            this.logger.log(`iOS push successful`);
            return response;
        } catch (error) {
            this.logger.error(`iOS push failed: ${error.message}`);
            throw error;
        }
    }

    async pushToUser(params: {
        userId: string;
        title: string;
        content: string;
        data?: any;
        appKey?: number;
    }) {
        try {
            const pushRequest = new ($Push20160801 as any).PushRequest({
                appKey: params.appKey || 334974694,
                target: 'ACCOUNT',
                targetValue: params.userId,
                title: params.title,
                body: params.content,
                pushType: 'NOTICE',
                androidNotifyType: 'BOTH',
                androidOpenType: 'APPLICATION',
                storeOffline: true,
                iOSApnsEnv: 'PRODUCT',
                iOSBadgeAutoIncrement: true,
                ...(params.data && { androidExtParameters: JSON.stringify(params.data) }),
                ...(params.data && { iOSExtParameters: JSON.stringify(params.data) })
            });

            const runtime = new ($Util as any).RuntimeOptions({});
            const response = await this.client.pushWithOptions(pushRequest, runtime);

            this.logger.log(`User push successful`);
            return response;
        } catch (error) {
            this.logger.error(`User push failed: ${error.message}`);
            throw error;
        }
    }
}