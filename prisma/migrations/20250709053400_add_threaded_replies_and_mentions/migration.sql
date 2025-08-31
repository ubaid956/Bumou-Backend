-- Add parentId to Comment for threaded replies
ALTER TABLE "Comment" ADD COLUMN "parentId" TEXT;

-- Add foreign key constraint for parent comments
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add mentionedUserIds array to Comment for user mentions
ALTER TABLE "Comment" ADD COLUMN "mentionedUserIds" TEXT[] DEFAULT '{}';

-- Add isRead field to Comment for tracking read status
ALTER TABLE "Comment" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;

-- Add commentId and postId to Notification for direct linking
ALTER TABLE "Notification" ADD COLUMN "commentId" TEXT;
ALTER TABLE "Notification" ADD COLUMN "postId" TEXT;

-- Add foreign key constraints for notifications
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for faster queries on comment parentId
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- Create index for faster queries on notification commentId and postId
CREATE INDEX "Notification_commentId_idx" ON "Notification"("commentId");
CREATE INDEX "Notification_postId_idx" ON "Notification"("postId");
