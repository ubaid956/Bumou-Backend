export declare class NotificationPayloadDto {
    userIds: string[];
    title?: string;
    subtitle?: string;
    content?: string;
    type?: NotificationType;
    data?: any;
}
export declare enum NotificationType {
    GENERAL = "GENERAL",
    FRIENDSHIP = "FRIENDSHIP",
    CHAT = "CHAT",
    MESSAGE = "MESSAGE",
    MOMENT = "MOMENT",
    CALL = "CALL",
    HELP = "HELP"
}
