/**
 * DTO for comment notification parameters
 */
export interface CommentNotificationDto {
  /**
   * ID of the user who created the comment or reply
   */
  commenterId: string;
  
  /**
   * ID of the user who will receive the notification
   */
  receiverId: string;
  
  /**
   * ID of the post that was commented on
   */
  postId: string;
  
  /**
   * ID of the comment
   */
  commentId: string;
  
  /**
   * Text content of the comment
   */
  commentText: string;
  
  /**
   * Whether this is a reply to another comment
   */
  isReply?: boolean;
  
  /**
   * ID of the parent comment if this is a reply
   */
  parentCommentId?: string;
}
