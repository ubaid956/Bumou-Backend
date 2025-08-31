export declare class GetUnreadCommentsDto {
    page?: number;
    pageSize?: number;
}
export declare class MarkCommentsAsReadDto {
    commentIds?: string[];
    postId?: string;
    notificationIds?: string[];
    markAll?: 'true' | 'false';
}
