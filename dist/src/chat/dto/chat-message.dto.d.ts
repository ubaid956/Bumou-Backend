import { ChatroomMessageStatus, ChatroomMessageType } from '@prisma/client';
export declare class ChatMessageDto {
    id?: string;
    receiverId?: string;
    senderId?: string;
    chatroomId?: string;
    message: string;
    type: ChatroomMessageType;
    status: ChatroomMessageStatus;
    file?: string;
    reply_id?: string;
}
