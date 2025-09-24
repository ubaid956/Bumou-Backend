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
                // CRITICAL FIX: Use MESSAGE for background delivery + immediate notification display
                pushType: 'MESSAGE',
                // Android notification configuration for system delivery
                androidNotifyType: 'BOTH', // Both vibrate and sound 
                androidOpenType: 'APPLICATION', // Open app when tapped
                storeOffline: true, // Store for offline delivery
                androidRemind: true, // Enable system alert
                // CRITICAL: Ensure immediate delivery in all states
                androidActivity: 'app.bumoumobile.com.MainActivity',
                androidMusic: 'default', // Use default notification sound
                androidNotificationBarType: 1, // Show in notification bar
                androidNotificationBarPriority: 1, // High priority
                // Custom parameters for routing
                ...(params.data && { androidExtParameters: JSON.stringify(params.data) })
            }); const runtime = new ($Util as any).RuntimeOptions({});
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
                iOSSound: 'default', // Add default sound
                iOSSubtitle: params.title,
                storeOffline: true, // Important: store when app is closed
                // Remove expireTime for now as it's causing format issues
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
                pushType: 'MESSAGE',
                androidNotifyType: 'BOTH',
                androidOpenType: 'APPLICATION',
                androidNotificationBarType: '1',
                androidNotificationBarPriority: '2',
                androidNotificationChannel: 'bumou_default',
                androidActivity: 'app.bumoumobile.com.MainActivity',
                storeOffline: true,
                expireTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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