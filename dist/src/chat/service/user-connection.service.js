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
exports.UserConnectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UserConnectionService = class UserConnectionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('UserConnectionService');
    }
    async addSession(sessionId, userId) {
        this.logger.debug(`Adding session for user ${userId} with id ${sessionId}`);
        try {
            const session = await this.prisma.userSession.create({
                data: {
                    id: sessionId.toString(),
                    token: sessionId,
                    userId,
                },
            });
            await this.prisma.user.update({
                where: { id: userId },
                data: { isOnline: true },
            });
            return session;
        }
        catch (error) {
            this.logger.debug(error);
        }
    }
    async getAllSessions(userId) {
        const sessions = await this.prisma.userSession.findMany({
            where: { userId },
        });
        return sessions;
    }
    async deleteSession(sessionId) {
        const session = await this.prisma.userSession.findFirst({
            where: { token: sessionId },
        });
        if (!session) {
            return;
        }
        await this.prisma.userSession.delete({ where: { id: session.id } });
        await this.prisma.user.update({
            where: { id: session.userId },
            data: { isOnline: false },
        });
        return session;
    }
};
exports.UserConnectionService = UserConnectionService;
exports.UserConnectionService = UserConnectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserConnectionService);
//# sourceMappingURL=user-connection.service.js.map