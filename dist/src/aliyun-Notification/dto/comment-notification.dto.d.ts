export interface CommentNotificationDto {
    commenterId: string;
    receiverId: string;
    postId: string;
    commentId: string;
    commentText: string;
    isReply?: boolean;
    parentCommentId?: string;
}
