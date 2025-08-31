export declare class AliyunPushService {
    private readonly logger;
    private client;
    constructor();
    private initializeClient;
    pushToAndroid(params: {
        deviceToken: string;
        title: string;
        content: string;
        data?: any;
        appKey?: number;
    }): Promise<any>;
    pushToIOS(params: {
        deviceToken: string;
        title: string;
        content: string;
        data?: any;
        appKey?: number;
    }): Promise<any>;
    pushToUser(params: {
        userId: string;
        title: string;
        content: string;
        data?: any;
        appKey?: number;
    }): Promise<any>;
}
