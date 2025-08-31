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
exports.FriendshipController = void 0;
const common_1 = require("@nestjs/common");
const guard_1 = require("../auth/guard");
const friendship_service_1 = require("./friendship.service");
const decorator_1 = require("../decorator");
const dto_1 = require("./dto");
const update_friendship_dto_1 = require("./dto/update-friendship.dto");
let FriendshipController = class FriendshipController {
    constructor(friendshipService) {
        this.friendshipService = friendshipService;
    }
    async addFriend(user, addFriendDto) {
        return this.friendshipService.addFriend(user, addFriendDto);
    }
    async getPendingFriendship(userId) {
        return this.friendshipService.getPendingFriendship(userId);
    }
    async getFriendSuggestions(user, page = 1, pageSize = 20) {
        return this.friendshipService.getFriendSuggestions(user, page, pageSize);
    }
    async acceptFriendship(user, body) {
        return this.friendshipService.acceptFriendship(user, body);
    }
    async removeFriend(user, friendId) {
        return this.friendshipService.removeFriend(user, friendId);
    }
    async getFriendships(userId) {
        return this.friendshipService.getFriendships(userId);
    }
    async searchFriends(userId, searchDto) {
        return this.friendshipService.searchFriends(userId, searchDto);
    }
};
exports.FriendshipController = FriendshipController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('/add'),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.AddFriendDto]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "addFriend", null);
__decorate([
    (0, common_1.Get)('/pending'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "getPendingFriendship", null);
__decorate([
    (0, common_1.Get)('/suggestions'),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('page', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('pageSize', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "getFriendSuggestions", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Patch)('/update'),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_friendship_dto_1.UpdateFriendshipDto]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "acceptFriendship", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Patch)('/remove-friend/:friendId'),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "removeFriend", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "getFriendships", null);
__decorate([
    (0, common_1.Get)('/search'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SearchFriendsDto]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "searchFriends", null);
exports.FriendshipController = FriendshipController = __decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Controller)('friendship'),
    __metadata("design:paramtypes", [friendship_service_1.FriendshipService])
], FriendshipController);
//# sourceMappingURL=friendship.controller.js.map