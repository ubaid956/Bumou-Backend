# Migration `20250709053400_add_threaded_replies_and_mentions`

This migration has been created manually to add support for threaded replies, user mentions, and unread status tracking to the Comment model.

## Changes

- Added `parentId` field to Comment model (nullable) with foreign key to support threaded replies
- Added `mentionedUserIds` array to Comment model to track mentioned users
- Added `isRead` boolean field to Comment model (default: false)
- Added `commentId` and `postId` fields to Notification model for direct linking
- Created appropriate indexes for query optimization
