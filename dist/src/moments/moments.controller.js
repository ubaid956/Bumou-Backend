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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MomentsController = void 0;
const common_1 = require("@nestjs/common");
const guard_1 = require("../auth/guard");
const decorator_1 = require("../decorator");
const utils_1 = require("../utils");
const dto_1 = require("./dto");
const moments_service_1 = require("./moments.service");
let MomentsController = class MomentsController {
    constructor(momentService) {
        this.momentService = momentService;
    }
    async getMyPosts(currentUserId, query) {
        return await this.momentService.getMyPosts(currentUserId, query);
    }
    async getUserPosts(currentUserId, userId, query) {
        return await this.momentService.getUserPosts(currentUserId, userId, query);
    }
    async createPost(userId, body) {
        return this.momentService.createPost(userId, body);
    }
    async getPosts(userId, page = 1, pageSize = 20, isAnonymous = false) {
        return this.momentService.getPosts(userId, page, pageSize, isAnonymous);
    }
    async addComment(userId, postId, body) {
        return this.momentService.addComment(userId, postId, body);
    }
    async getComments(postId, page = 1, pageSize = 20) {
        return this.momentService.getComments(postId, page, pageSize);
    }
    async addReply(userId, postId, commentId, body) {
        return this.momentService.addReply(userId, postId, commentId, body);
    }
    async deleteComment(userId, postId, commentId) {
        return this.momentService.deleteComment(userId, postId, commentId);
    }
    async likePost(userId, postId) {
        return this.momentService.likePost(userId, postId);
    }
    async getLikes(postId, page = 1, pageSize = 20) {
        return this.momentService.getLikes(postId, page, pageSize);
    }
    async deletePost(userId, postId) {
        return this.momentService.deletePost(userId, postId);
    }
    async getUnreadCount(userId) {
        return this.momentService.getUnreadCount(userId);
    }
    async markPostAsViewed(userId, postId) {
        return this.momentService.markPostAsViewed(userId, postId);
    }
};
exports.MomentsController = MomentsController;
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, utils_1.PaginationRequest]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "getMyPosts", null);
__decorate([
    (0, common_1.Get)('user/:id'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, utils_1.PaginationRequest]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "getUserPosts", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreatePostDto]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)('page', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('pageSize', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('isAnonymous')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "getPosts", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(':postId/comment'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.AddCommentDto]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(':postId/comments'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('page', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('pageSize', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "getComments", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(':postId/comment/:commentId/reply'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Param)('commentId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, dto_1.AddReplyDto]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "addReply", null);
__decorate([
    (0, common_1.Delete)(':postId/comment/:commentId'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(':postId/like'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "likePost", null);
__decorate([
    (0, common_1.Get)(':postId/likes'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('page', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('pageSize', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "getLikes", null);
__decorate([
    (0, common_1.Delete)(':postId'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Post)(':postId/view'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MomentsController.prototype, "markPostAsViewed", null);
exports.MomentsController = MomentsController = __decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Controller)('moments'),
    __metadata("design:paramtypes", [moments_service_1.MomentsService])
], MomentsController);
//# sourceMappingURL=moments.controller.js.map