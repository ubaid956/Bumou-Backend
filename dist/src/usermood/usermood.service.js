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
exports.UsermoodService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const moments_service_1 = require("../moments/moments.service");
const nestjs_i18n_1 = require("nestjs-i18n");
let UsermoodService = class UsermoodService {
    constructor(prisma, momentService, i18n) {
        this.prisma = prisma;
        this.momentService = momentService;
        this.i18n = i18n;
    }
    async create(userId, payload) {
        const usermood = await this.prisma.userMood.create({
            data: {
                ...payload,
                userId,
            },
        });
        if (usermood) {
            const momentPost = {
                text: `${this.i18n.translate('t.i_m_feeling', {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                })} ${this.i18n.translate(`t.${usermood.mood}`, {
                    lang: nestjs_i18n_1.I18nContext.current().lang,
                })}. ${usermood.note || ''}`,
                isAnonymous: false,
            };
            const moment = await this.momentService.createPost(userId, momentPost);
        }
        return usermood;
    }
    async moodPercentOfDays(userId, previousDaysOf) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - previousDaysOf);
        const moodData = await this.prisma.userMood.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                },
            },
        });
        const moodCount = new Map();
        for (const moodType of Object.values(client_1.UserMoodType)) {
            moodCount.set(moodType, 0);
        }
        for (const moodEntry of moodData) {
            const moodType = moodEntry.mood;
            moodCount.set(moodType, moodCount.get(moodType) + 1);
        }
        const totalMoodEntries = moodData.length;
        const moodPercentages = Object.values(client_1.UserMoodType).map((mood) => ({
            mood,
            percentage: (moodCount.get(mood) / totalMoodEntries) * 100,
        }));
        return moodPercentages;
    }
};
exports.UsermoodService = UsermoodService;
exports.UsermoodService = UsermoodService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        moments_service_1.MomentsService,
        nestjs_i18n_1.I18nService])
], UsermoodService);
//# sourceMappingURL=usermood.service.js.map