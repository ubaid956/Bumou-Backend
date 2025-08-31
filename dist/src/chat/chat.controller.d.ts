import { ChatService } from './service/chat.service';
import { MessageService } from './service/message.service';
export declare class ChatController {
    private messageService;
    private readonly chatService;
    constructor(messageService: MessageService, chatService: ChatService);
    getChatRooms(userId: string, page?: string, pageSize?: string): Promise<{
        unreadCount: number;
        _count: {
            messages: number;
        };
        messages: ({
            readBy: {
                id: string;
                createdAt: Date;
                userId: string;
                chatroomId: string;
                messageId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            payload: string | null;
            chatroomId: string;
            senderId: string;
            message: string;
            status: import(".prisma/client").$Enums.ChatroomMessageStatus;
            type: import(".prisma/client").$Enums.ChatroomMessageType;
            file: string | null;
            reply_id: string | null;
            call_message_status: import(".prisma/client").$Enums.CallMessageStatus | null;
        })[];
        members: {
            id: string;
            email: string;
            username: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            password: string;
            userType: import(".prisma/client").$Enums.UserType;
            local: string | null;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            zip: string | null;
            country: string | null;
            schoolName: string | null;
            className: string | null;
            teacherName: string | null;
            isVerified: boolean;
            isBlocked: boolean;
            isOnline: boolean;
            isDeleted: boolean;
            isHelping: boolean;
            Aliyun_token: string | null;
            device_type: string | null;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        lastMessage: string | null;
    }[]>;
    deleteMessage(messageId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        payload: string | null;
        chatroomId: string;
        senderId: string;
        message: string;
        status: import(".prisma/client").$Enums.ChatroomMessageStatus;
        type: import(".prisma/client").$Enums.ChatroomMessageType;
        file: string | null;
        reply_id: string | null;
        call_message_status: import(".prisma/client").$Enums.CallMessageStatus | null;
    }>;
    deleteChatRoom(chatroomId: string): Promise<[import(".prisma/client").Prisma.BatchPayload, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        lastMessage: string | null;
    }]>;
    getMessages(chatroomId: string, userId: string, page?: number, pageSize?: number): Promise<({
        readBy: {
            id: string;
            createdAt: Date;
            userId: string;
            chatroomId: string;
            messageId: string;
        }[];
        reply: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            payload: string | null;
            chatroomId: string;
            senderId: string;
            message: string;
            status: import(".prisma/client").$Enums.ChatroomMessageStatus;
            type: import(".prisma/client").$Enums.ChatroomMessageType;
            file: string | null;
            reply_id: string | null;
            call_message_status: import(".prisma/client").$Enums.CallMessageStatus | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        payload: string | null;
        chatroomId: string;
        senderId: string;
        message: string;
        status: import(".prisma/client").$Enums.ChatroomMessageStatus;
        type: import(".prisma/client").$Enums.ChatroomMessageType;
        file: string | null;
        reply_id: string | null;
        call_message_status: import(".prisma/client").$Enums.CallMessageStatus | null;
    })[]>;
    markMessageAsRead(userId: string, messageId: string, chatroomId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        chatroomId: string;
        messageId: string;
    }>;
}
