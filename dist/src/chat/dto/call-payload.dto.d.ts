export declare enum CallType {
    OFFER = "offer",
    ANSWER = "answer",
    CANDIDATE = "candidate"
}
export declare class CallDto {
    type: CallType;
    senderId: string;
    receiverId: string;
    isVideo: boolean;
    payload: any;
}
