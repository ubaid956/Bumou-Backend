export declare class SmsService {
    private readonly logger;
    private client;
    constructor();
    private normalizePhoneNumber;
    sendVerificationCode(phoneNumber: string, code: string): Promise<boolean>;
}
