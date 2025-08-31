export interface CommentNotificationParams {
    postId: string;
    commentId: string;
    postOwnerId: string;
    commenterId: string;
    commenterName: string;
    postTitle: string;
}
export interface ReplyNotificationParams {
    postId: string;
    commentId: string;
    replyId: string;
    postOwnerId: string;
    originalCommentOwnerId: string;
    replierId: string;
    replierName: string;
    commentText: string;
}
