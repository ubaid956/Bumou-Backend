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
exports.UsermoodController = void 0;
const common_1 = require("@nestjs/common");
const usermood_service_1 = require("./usermood.service");
const decorator_1 = require("../decorator");
const add_usermood_dto_1 = require("./dto/add-usermood.dto");
const guard_1 = require("../auth/guard");
let UsermoodController = class UsermoodController {
    constructor(usermoodService) {
        this.usermoodService = usermoodService;
    }
    async create(userId, payload) {
        return this.usermoodService.create(userId, payload);
    }
    async moodPercentOfDays(userId, previousDaysOf = 7) {
        return this.usermoodService.moodPercentOfDays(userId, previousDaysOf);
    }
};
exports.UsermoodController = UsermoodController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_usermood_dto_1.AddUsermoodDto]),
    __metadata("design:returntype", Promise)
], UsermoodController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('moodpercentofdays'),
    __param(0, (0, decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)('previousDaysOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UsermoodController.prototype, "moodPercentOfDays", null);
exports.UsermoodController = UsermoodController = __decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Controller)('usermood'),
    __metadata("design:paramtypes", [usermood_service_1.UsermoodService])
], UsermoodController);
//# sourceMappingURL=usermood.controller.js.map