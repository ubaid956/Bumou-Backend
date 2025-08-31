<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## API Documentation

### Chat Module

#### Message and Chat Room Deletion

The Chat module provides functionality for managing messages and chat rooms, including deletion capabilities.

##### Delete a Message

```
DELETE /chat/messages/:messageId
```

**Request Parameters:**

- `messageId` (path parameter): ID of the message to delete

**Authentication:**

- Requires JWT token (JwtGuard)
- User must be the sender of the message

**Response:**

- On success: Returns the deleted message object
- On failure: 403 Forbidden if the message doesn't exist or user is not authorized

**Implementation Notes:**

- Only the sender of a message can delete it
- Message is permanently deleted from the database

##### Delete a Chat Room

```
DELETE /chat/chatrooms/:chatroomId
```

**Request Parameters:**

- `chatroomId` (path parameter): ID of the chat room to delete

**Authentication:**

- Requires JWT token (JwtGuard)

**Response:**

- On success: Returns the result of the transaction
- On failure: 403 Forbidden if the chat room doesn't exist

**Implementation Notes:**

- Deleting a chat room also deletes all associated read status records
- Uses a database transaction to ensure consistency
- This operation cannot be undone

### Moments Module

#### Comments and Replies

The Moments module provides functionality for users to interact with posts through comments and replies.

##### Add a Comment to a Post

```
POST /moments/:postId/comment
```

**Request Parameters:**

- `postId` (path parameter): ID of the post to comment on

**Request Body:**

```json
{
  "comment": "This is my comment on the post"
}
```

**Response:**

```json
{
  "id": "comment-uuid",
  "text": "This is my comment on the post",
  "postId": "post-uuid",
  "userId": "user-uuid",
  "createdAt": "2025-06-27T14:25:00Z",
  "updatedAt": "2025-06-27T14:25:00Z"
}
```

##### Add a Reply to a Comment

```
POST /moments/:postId/comment/:commentId/reply
```

**Request Parameters:**

- `postId` (path parameter): ID of the post containing the comment
- `commentId` (path parameter): ID of the comment to reply to

**Request Body:**

```json
{
  "reply": "This is my reply to your comment",
  "parentCommentId": "comment-uuid-to-reply-to"
}
```

**Response:**

```json
{
  "id": "reply-uuid",
  "text": "This is my reply to your comment",
  "postId": "post-uuid",
  "userId": "user-uuid",
  "createdAt": "2025-06-27T14:30:00Z",
  "updatedAt": "2025-06-27T14:30:00Z",
  "isReply": true,
  "parentCommentId": "comment-uuid-to-reply-to"
}
```

##### Get Comments for a Post

```
GET /moments/:postId/comments?page=1&pageSize=20
```

**Request Parameters:**

- `postId` (path parameter): ID of the post to get comments for
- `page` (query parameter, optional): Page number (default: 1)
- `pageSize` (query parameter, optional): Number of comments per page (default: 20)

**Response:**

```json
[
  {
    "id": "comment-uuid-1",
    "text": "This is a regular comment",
    "postId": "post-uuid",
    "userId": "user-uuid",
    "createdAt": "2025-06-27T14:25:00Z",
    "updatedAt": "2025-06-27T14:25:00Z",
    "isReply": false,
    "parentCommentId": null,
    "user": {
      "id": "user-uuid",
      "username": "username",
      "firstName": "First",
      "lastName": "Last",
      "profilePicture": "url-to-profile-picture",
      "userType": "ADULT"
    }
  },
  {
    "id": "comment-uuid-2",
    "text": "This is a reply to the first comment",
    "postId": "post-uuid",
    "userId": "user-uuid-2",
    "createdAt": "2025-06-27T14:30:00Z",
    "updatedAt": "2025-06-27T14:30:00Z",
    "isReply": true,
    "parentCommentId": "comment-uuid-1",
    "user": {
      "id": "user-uuid-2",
      "username": "username2",
      "firstName": "First2",
      "lastName": "Last2",
      "profilePicture": "url-to-profile-picture-2",
      "userType": "STUDENT"
    }
  }
]
```

##### Delete a Comment

```
DELETE /moments/:postId/comment/:commentId
```

**Request Parameters:**

- `postId` (path parameter): ID of the post containing the comment
- `commentId` (path parameter): ID of the comment to delete

**Response:**

```json
{
  "message": "Comment deleted successfully"
}
```

**Notes:**

- Comment replies are implemented using a metadata approach where reply information is embedded in the comment text.
- Comments are returned with additional properties `isReply` and `parentCommentId` to indicate if a comment is a reply and which comment it's replying to.
- Users will receive push notifications when someone comments on their post or replies to their comment.
- The system ensures that post owners and comment owners are notified appropriately.

### Friendship Module

#### Get Friends List

```
GET /friendship
```

**Request Parameters:**

- None

**Response:**

```json
[
  {
    "friendshipId": "friendship-uuid-1",
    "id": "user-uuid-1",
    "username": "username1",
    "firstName": "First1",
    "lastName": "Last1",
    "email": "user1@example.com",
    "profilePicture": "url-to-profile-picture-1",
    "userType": "ADULT"
  },
  {
    "friendshipId": "friendship-uuid-2",
    "id": "user-uuid-2",
    "username": "username2",
    "firstName": "First2",
    "lastName": "Last2",
    "email": "user2@example.com",
    "profilePicture": "url-to-profile-picture-2",
    "userType": "STUDENT"
  }
]
```

#### Search Friends

```
GET /friendship/search?query=john&page=1&pageSize=20
```

**Request Parameters:**

- `query` (query parameter): The search term to find friends by username, first name, last name, or email
- `page` (query parameter, optional): Page number for pagination (default: 1)
- `pageSize` (query parameter, optional): Number of results per page (default: 20)

**Response:**

```json
{
  "data": [
    {
      "id": "user-uuid-1",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "profilePicture": "url-to-profile-picture",
      "userType": "ADULT",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-06-20T15:45:00Z",
      "friendshipId": "friendship-uuid-1"
    },
    {
      "id": "user-uuid-2",
      "username": "johnny",
      "firstName": "Johnny",
      "lastName": "Smith",
      "email": "johnny@example.com",
      "profilePicture": "url-to-profile-picture-2",
      "userType": "STUDENT",
      "createdAt": "2025-02-10T09:15:00Z",
      "updatedAt": "2025-06-25T11:20:00Z",
      "friendshipId": "friendship-uuid-2"
    }
  ],
  "meta": {
    "totalCount": 5,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

**Notes:**

- The search is performed across username, first name, last name, and email fields.
- The search is case-insensitive.
- Results include the friendshipId which can be used to remove or manage the friendship.
- Pagination metadata is provided to help with navigation through large result sets.
- Only accepted friendships are included in the search results.

### Notifications Module

The Notifications module provides a comprehensive system for managing user notifications, including notifications for comments and replies on posts (moments) following Facebook-like logic.

#### Notification Types

The system supports various notification types including:

- **MOMENT**: Notifications related to posts/moments
- **MESSAGE**: Notifications for chat messages
- **FRIENDSHIP**: Notifications for friend requests
- **GENERAL**: General system notifications

#### How Notifications Work

1. **Comment Notifications**: When a user comments on a post, the post owner receives a notification (unless they commented on their own post).
2. **Reply Notifications**: When a user replies to a comment, both the original commenter and the post owner receive notifications (unless they are the same person or the replier).
3. **Stored and Delivered**: All notifications are stored in the database and can also be delivered as push notifications.

#### Get All Notifications

```
GET /notifications?page=1&size=10
```

**Request Parameters:**

- `page` (query parameter, optional): Page number for pagination (default: 1)
- `size` (query parameter, optional): Number of results per page (default: 10)

**Authentication:**

- Requires JWT token (JwtGuard)

**Response:**

```json
{
  "data": [
    {
      "id": "notification-uuid-1",
      "createdAt": "2025-07-02T09:45:30Z",
      "updatedAt": "2025-07-02T09:45:30Z",
      "userId": "user-uuid-1",
      "type": "MOMENT",
      "content": "John Doe commented on your post: 'Amazing sunset view!'",
      "read": false,
      "metadata": {
        "postId": "post-uuid-1",
        "commentId": "comment-uuid-1",
        "userId": "commenter-uuid-1",
        "type": "comment"
      }
    },
    {
      "id": "notification-uuid-2",
      "createdAt": "2025-07-01T15:20:10Z",
      "updatedAt": "2025-07-01T16:05:45Z",
      "userId": "user-uuid-1",
      "type": "MOMENT",
      "content": "Jane Smith replied to a comment: 'I agree with your point'",
      "read": true,
      "metadata": {
        "postId": "post-uuid-2",
        "commentId": "comment-uuid-2",
        "replyId": "reply-uuid-1",
        "userId": "replier-uuid-1",
        "type": "reply",
        "isReply": true
      }
    }
  ],
  "meta": {
    "total": 24,
    "page": 1,
    "size": 10,
    "totalPages": 3,
    "hasNext": true
  }
}
```

#### Get Unread Notifications Count

```
GET /notifications/unread-count
```

**Authentication:**

- Requires JWT token (JwtGuard)

**Response:**

```json
{
  "count": 5
}
```

#### Mark Notification as Read

```
PATCH /notifications/:id/mark-read
```

**Request Parameters:**

- `id` (path parameter): ID of the notification to mark as read

**Authentication:**

- Requires JWT token (JwtGuard)

**Response:**

```json
{
  "id": "notification-uuid-1",
  "createdAt": "2025-07-02T09:45:30Z",
  "updatedAt": "2025-07-03T13:20:15Z",
  "userId": "user-uuid-1",
  "type": "MOMENT",
  "content": "John Doe commented on your post: 'Amazing sunset view!'",
  "read": true,
  "metadata": {
    "postId": "post-uuid-1",
    "commentId": "comment-uuid-1",
    "userId": "commenter-uuid-1",
    "type": "comment"
  }
}
```

#### Mark All Notifications as Read

```
POST /notifications/mark-all-read
```

**Authentication:**

- Requires JWT token (JwtGuard)

**Response:**

```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

#### Delete Notification

```
DELETE /notifications/:id
```

**Request Parameters:**

- `id` (path parameter): ID of the notification to delete

**Authentication:**

- Requires JWT token (JwtGuard)

**Response:**

```json
{
  "id": "notification-uuid-1",
  "createdAt": "2025-07-02T09:45:30Z",
  "updatedAt": "2025-07-03T13:25:40Z",
  "userId": "user-uuid-1",
  "type": "MOMENT",
  "content": "John Doe commented on your post: 'Amazing sunset view!'",
  "read": true,
  "metadata": {
    "postId": "post-uuid-1",
    "commentId": "comment-uuid-1",
    "userId": "commenter-uuid-1",
    "type": "comment"
  }
}
```

#### Notification Events

Notifications are automatically created when:

1. **A user comments on a post**: The post owner receives a notification with metadata containing the post ID, comment ID, and commenter ID.
2. **A user replies to a comment**: Both the original comment owner and the post owner receive notifications with metadata containing the post ID, comment ID, reply ID, and replier ID.

**Implementation Notes:**

- Notifications follow a Facebook-like model for determining recipients
- Notifications include rich metadata allowing client applications to create deep links
- The system avoids sending notifications to users about their own actions
- Both database storage and push notifications are supported

### Moment Unread Count API

#### Get Unread Moments Count

Returns the count of unread comments and likes on moments since the user last viewed them.

```
GET /moments/unread-count
```

**Authentication:**

- Requires JWT token (JwtGuard)

**Response:**

```json
{
  "unreadComments": 5,
  "unreadLikes": 3,
  "totalUnread": 8
}
```

**Implementation Notes:**

- Counts are calculated based on timestamps of the last view of each post
- Only counts interactions that happened after the user last viewed the post
- New posts that have never been viewed will have all interactions counted as unread

#### Mark Post as Viewed

Marks a post as viewed by the user, updating the timestamp of the last view.

```
POST /moments/:postId/view
```

**Request Parameters:**

- `postId` (path parameter): ID of the post to mark as viewed

**Authentication:**

- Requires JWT token (JwtGuard)

**Response:**

```json
{
  "success": true
}
```

**Implementation Notes:**

- Updates the lastViewedAt timestamp for the specified post
- Creates a new view record if the user has never viewed the post before
- Used to reset the unread count for the post's interactions

### Unified Badge Count API

#### Get Unified Unread Count

Returns a consolidated count of all unread items across the application.

```
GET /users/unread-count
```

**Authentication:**

- Requires JWT token (JwtGuard)

**Response:**

```json
{
  "moments": 8,
  "messages": 3,
  "notifications": 5,
  "totalUnread": 16
}
```

**Implementation Notes:**

- Aggregates unread counts from moments, messages, and notifications in a single request
- Optimized to minimize database queries for performance
- Provides both individual category counts and a total count
- Helps client applications display accurate badge counts without multiple API calls
