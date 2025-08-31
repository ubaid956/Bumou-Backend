import { PushNotificationService } from './push-notification.service';
export declare class PushNotificationController {
    private pushNotificationService;
    constructor(pushNotificationService: PushNotificationService);
    sendPushNotification(userId: string, message: string, email: string): Promise<void>;
}
