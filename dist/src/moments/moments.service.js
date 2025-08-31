"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MomentsService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_i18n_1 = require("nestjs-i18n");
const prisma_service_1 = require("../prisma/prisma.service");
const push_notification_service_1 = require("../aliyun-Notification/push-notification.service");
const push_notification_comment_service_1 = require("../aliyun-Notification/push-notification-comment.service");
let MomentsService = class MomentsService {
    constructor(prisma, i18n, pushNotificationService, pushNotificationCommentService) {
        this.prisma = prisma;
        this.i18n = i18n;
        this.pushNotificationService = pushNotificationService;
        this.pushNotificationCommentService = pushNotificationCommentService;
    }
    async getUserPosts(currentUserId, userId, query) {
        let { page, size } = query;
        if (page < 1) {
            page = 1;
        }
        const skip = (page - 1) * size;
        const posts = await this.prisma.post.findMany({
            where: {
                userId,
                is_anonymous: false,
            },
            take: size,
            skip,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                mediaAttachments: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        userType: true,
                    },
                },
                comments: {
                    take: 3,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                userType: true,
                            },
                        },
                    },
                },
                likes: {
                    where: {
                        userId: currentUserId,
                    },
                },
            },
        });
        const postsWithExtras = posts.map((post) => {
            const numberOfLikes = post.total_likes;
            return {
                ...post,
                numberOfLikes,
                isLikeByMe: post.likes.length > 0,
            };
        });
        return postsWithExtras;
    }
    async getMyPosts(userId, query) {
        let { page, size } = query;
        if (page < 1) {
            page = 1;
        }
        const skip = (page - 1) * size;
        const posts = await this.prisma.post.findMany({
            where: {
                userId,
            },
            take: size,
            skip,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                mediaAttachments: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        userType: true,
                    },
                },
                comments: {
                    take: 3,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                userType: true,
                            },
                        },
                    },
                },
                likes: {
                    where: {
                        userId,
                    },
                },
            },
        });
        const postsWithExtras = posts.map((post) => {
            const numberOfLikes = post.total_likes;
            return {
                ...post,
                numberOfLikes,
                isLikeByMe: post.likes.length > 0,
            };
        });
        return postsWithExtras;
    }
    async createPost(userId, body) {
        if (!body || (body.mediaAttachments == null && body.text == null)) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.please_attach_some_data_text_image_or_video', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        const post = await this.prisma.post.create({
            data: {
                text: body.text,
                userId: userId,
                is_anonymous: body.isAnonymous,
                mediaAttachments: {
                    create: body.mediaAttachments,
                },
            },
        });
        return post;
    }
    async getPosts(userId, page, pageSize, isAnonymous = false) {
        try {
            if (page === 0) {
                throw new common_1.ForbiddenException(this.i18n.translate('t.page_must_be_greater_than_0', {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                }));
            }
            const skip = (page - 1) * pageSize;
            const posts = await this.prisma.post.findMany({
                where: {
                    OR: [
                        { userId },
                        {
                            user: {
                                OR: [
                                    {
                                        friends1: {
                                            some: {
                                                user2Id: userId,
                                                status: 'ACCEPTED',
                                            },
                                        },
                                    },
                                    {
                                        friends2: {
                                            some: {
                                                user1Id: userId,
                                                status: 'ACCEPTED',
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        isAnonymous ? { is_anonymous: true } : {},
                    ],
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
                include: {
                    mediaAttachments: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                            userType: true,
                        },
                    },
                    comments: {
                        take: 3,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    firstName: true,
                                    lastName: true,
                                    profilePicture: true,
                                    userType: true,
                                },
                            },
                        },
                    },
                    likes: {
                        where: {
                            userId,
                        },
                    },
                },
            });
            const ananymousUser = await this.prisma.user.findFirst({
                where: {
                    id: 'anonymous',
                },
            });
            const postsWithExtras = posts.map((post) => {
                const numberOfLikes = post.total_likes;
                if (post.is_anonymous) {
                    post.user = ananymousUser;
                }
                const processedComments = post.comments.map(comment => {
                    const replyMatch = comment.text.match(/^\[REPLY:([^\]]+)\]\s+(.*)/);
                    if (replyMatch) {
                        const parentCommentId = replyMatch[1];
                        const actualText = replyMatch[2];
                        return {
                            ...comment,
                            text: actualText,
                            isReply: true,
                            parentCommentId: parentCommentId
                        };
                    }
                    return {
                        ...comment,
                        isReply: false,
                        parentCommentId: null
                    };
                });
                return {
                    ...post,
                    comments: processedComments,
                    numberOfLikes,
                    isLikeByMe: post.likes.length > 0,
                };
            });
            return postsWithExtras;
        }
        catch (error) {
            throw new common_1.ForbiddenException(error.message);
        }
    }
    async addComment(userId, postId, body) {
        const post = await this.prisma.post.findFirst({
            where: { id: postId },
            include: { user: true }
        });
        if (!post) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.post_not_found', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        const comment = await this.prisma.comment.create({
            data: {
                text: body.comment,
                postId: postId,
                userId: userId,
            },
        });
        if (userId !== post.userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { firstName: true, lastName: true }
            });
            await this.pushNotificationService.sendCommentNotification(userId);
            await this.pushNotificationCommentService.sendCommentNotification(userId, post.userId, postId, comment.id, body.comment);
        }
        this.updateTotalComments(postId);
        return comment;
    }
    async addReply(userId, postId, commentId, body) {
        const post = await this.prisma.post.findFirst({
            where: { id: postId },
            include: { user: true }
        });
        if (!post) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.post_not_found', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        const parentComment = await this.prisma.comment.findFirst({
            where: { id: commentId, postId: postId },
            include: { user: true }
        });
        if (!parentComment) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.comment_not_found', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        const replyMetadata = `[REPLY:${commentId}]`;
        const replyText = `${replyMetadata} ${body.reply}`;
        const reply = await this.prisma.comment.create({
            data: {
                text: replyText,
                postId: postId,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        userType: true,
                    },
                }
            }
        });
        if (userId !== parentComment.userId) {
            await this.pushNotificationService.sendCommentNotification({
                commenterId: userId,
                postOwnerId: post.userId,
                postId: postId,
                isReply: false
            });
        }
        if (post.userId !== parentComment.userId && post.userId !== userId) {
            await this.pushNotificationService.sendCommentNotification({
                commenterId: userId,
                postOwnerId: parentComment.userId,
                postId: postId,
                commentId: reply.id,
                commentText: body.reply,
                isReply: true,
                parentCommentId: commentId
            });
        }
        await this.pushNotificationService.sendCommentNotification({
            commenterId: userId,
            postOwnerId: post.userId,
            postId: postId,
            commentId: reply.id,
            commentText: body.reply,
            isReply: true,
            parentCommentId: commentId
        });
        await this.updateTotalComments(postId);
        return {
            ...reply,
            text: body.reply,
            isReply: true,
            parentCommentId: commentId
        };
    }
    async deleteComment(userId, postId, commentId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment || comment.userId !== userId) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.comment_not_found_or_not_authorized', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        await this.prisma.comment.delete({
            where: { id: commentId },
        });
        this.updateTotalComments(postId);
        return { message: 'Comment deleted successfully' };
    }
    async getComments(postId, page, pageSize) {
        if (page === 0) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.page_must_be_greater_than_0', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        const skip = (page - 1) * pageSize;
        const comments = await this.prisma.comment.findMany({
            where: { postId: postId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        userType: true,
                    },
                },
            },
            skip,
            take: pageSize,
        });
        const processedComments = comments.map(comment => {
            const replyMatch = comment.text.match(/^\[REPLY:([^\]]+)\]\s+(.*)/);
            if (replyMatch) {
                const parentCommentId = replyMatch[1];
                const actualText = replyMatch[2];
                return {
                    ...comment,
                    text: actualText,
                    isReply: true,
                    parentCommentId: parentCommentId
                };
            }
            return {
                ...comment,
                isReply: false,
                parentCommentId: null
            };
        });
        return processedComments;
    }
    async likePost(userId, postId) {
        const post = await this.prisma.post.findFirst({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.post_not_found', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        const like = await this.prisma.like.findFirst({
            where: {
                userId: userId,
                postId: postId,
            },
        });
        if (like) {
            await this.prisma.like.delete({
                where: { id: like.id },
            });
            return {
                message: this.i18n.translate('t.post_unliked_successfuly', {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                }),
                isLikeByMe: false,
            };
        }
        await this.prisma.like.create({
            data: {
                postId: postId,
                userId: userId,
            },
        });
        this.updateTotalLikes(postId);
        try {
            if (userId !== post.userId) {
                await this.pushNotificationService.sendLikeNotification({
                    likerId: userId,
                    postOwnerId: post.userId,
                    postId: postId,
                });
            }
        }
        catch (e) {
        }
        return {
            message: this.i18n.translate('t.post_liked_successfuly', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }),
            isLikeByMe: true,
        };
    }
    async getLikes(postId, page, pageSize) {
        if (page === 0) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.page_must_be_greater_than_0', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        const skip = (page - 1) * pageSize;
        const [likes, totalLikesCount] = await Promise.all([
            this.prisma.like.findMany({
                where: { postId: postId },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                            userType: true,
                        },
                    },
                },
                skip,
                take: pageSize,
            }),
            this.prisma.like.count({
                where: { postId: postId },
            }),
        ]);
        return { likes, totalLikesCount };
    }
    async deletePost(userId, postId) {
        const post = await this.prisma.post.findFirst({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.post_not_found', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        if (post.userId !== userId) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.you_are_not_allowed_to_delete_this_post', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        await this.prisma.post.delete({
            where: { id: postId },
        });
        return {
            message: this.i18n.translate('t.post_deleted_successfuly', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }),
        };
    }
    async updateTotalLikes(postId) {
        const aggregate = await this.prisma.like.aggregate({
            where: {
                postId,
            },
            _count: true,
        });
        await this.prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                total_likes: aggregate._count,
            },
        });
    }
    async updateTotalComments(postId) {
        const aggregate = await this.prisma.comment.aggregate({
            where: {
                postId,
            },
            _count: true,
        });
        await this.prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                total_comments: aggregate._count,
            },
        });
    }
    async getUnreadCount(userId) {
        const posts = await this.prisma.post.findMany({
            where: {
                OR: [
                    { userId },
                    {
                        user: {
                            OR: [
                                {
                                    friends1: {
                                        some: {
                                            user2Id: userId,
                                            status: 'ACCEPTED',
                                        },
                                    },
                                },
                                {
                                    friends2: {
                                        some: {
                                            user1Id: userId,
                                            status: 'ACCEPTED',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
            select: {
                id: true,
                total_comments: true,
                total_likes: true,
                viewStatus: {
                    where: {
                        userId
                    }
                },
                comments: {
                    select: {
                        id: true,
                        createdAt: true,
                    }
                },
                likes: {
                    select: {
                        id: true,
                        createdAt: true,
                    }
                }
            }
        });
        let unreadComments = 0;
        let unreadLikes = 0;
        posts.forEach(post => {
            const viewStatus = post.viewStatus[0];
            if (!viewStatus) {
                unreadComments += post.comments.length;
                unreadLikes += post.likes.length;
            }
            else {
                const lastViewedAt = new Date(viewStatus.lastViewedAt);
                const newComments = post.comments.filter(comment => comment.createdAt > lastViewedAt).length;
                const newLikes = post.likes.filter(like => like.createdAt > lastViewedAt).length;
                unreadComments += newComments;
                unreadLikes += newLikes;
            }
        });
        return {
            unreadComments,
            unreadLikes,
            totalUnread: unreadComments + unreadLikes
        };
    }
    async markPostAsViewed(userId, postId) {
        await this.prisma.postViewStatus.upsert({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            },
            update: {
                lastViewedAt: new Date(),
            },
            create: {
                userId,
                postId,
                lastViewedAt: new Date(),
            }
        });
        return { success: true };
    }
};
exports.MomentsService = MomentsService;
exports.MomentsService = MomentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nestjs_i18n_1.I18nService,
        push_notification_service_1.PushNotificationService,
        push_notification_comment_service_1.PushNotificationCommentService])
], MomentsService);
//# sourceMappingURL=moments.service.js.map