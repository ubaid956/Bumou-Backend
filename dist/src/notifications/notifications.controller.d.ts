import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(userId: string, page?: number, pageSize?: number): Promise<{
        notifications: any;
        meta: {
            totalCount: any;
            unreadCount: any;
            page: number;
            pageSize: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    markAsRead(userId: string, notificationId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
    getUnreadCount(userId: string): Promise<{
        count: any;
    }>;
    deleteNotification(userId: string, notificationId: string): Promise<any>;
}
