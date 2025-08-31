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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const nestjs_i18n_1 = require("nestjs-i18n");
const otp_service_1 = require("../otp/otp.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config, otpService, i18n) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.otpService = otpService;
        this.i18n = i18n;
    }
    verifyJwt(jwt) {
        return this.jwt.verifyAsync(jwt, {
            secret: this.config.get('JWT_SECRET'),
        });
    }
    async getCurrentUser(user) {
        const access_token = await this.signToken(user);
        return { ...user, access_token };
    }
    async _registerDevice(Aliyun_token, device_type, userId) {
        this.prisma.userDeviceToken.deleteMany({});
        const tokens = await this.prisma.userDeviceToken.findMany({
            where: {
                AND: [
                    {
                        userId: { equals: userId },
                    },
                ],
            },
        });
        const logger = new common_1.Logger('AuthService');
        logger.debug('Token created successfully 1 --> ' + tokens.length);
        logger.debug('Token created successfully 2 --> ' + device_type);
        logger.debug('Token created successfully 3 --> ' + userId);
        logger.debug('Token created successfully 3 --> ' + Aliyun_token);
        if (tokens.length == 0) {
            await this.prisma.userDeviceToken.create({
                data: {
                    token: Aliyun_token,
                    userId: userId,
                    device_type: device_type,
                },
            });
            logger.debug('Token created successfully --> ' + Aliyun_token);
        }
        else {
            await this.prisma.userDeviceToken.updateMany({
                where: { userId: userId },
                data: {
                    device_type: device_type,
                    token: Aliyun_token,
                },
            });
            logger.debug('Token created successfully --> ' + Aliyun_token);
        }
    }
    async isUsernameAvailable(username) {
        const user = await this.prisma.user.findFirst({ where: { username } });
        return { isAvailable: !user };
    }
    async isEmailAvailable(email) {
        const user = await this.prisma.user.findFirst({ where: { email } });
        return { isAvailable: !user };
    }
    async isPhoneAvailable(phone) {
        const user = await this.prisma.user.findFirst({ where: { phone } });
        return { isAvailable: !user };
    }
    async register(registerDto) {
        try {
            if (!registerDto.email || registerDto.email === '') {
                registerDto.email = registerDto.username + '@bumou.com';
            }
            const otpResult = await this.otpService.sendOtp(registerDto.phone);
            console.log('Phone Number (raw): ', registerDto.phone);
            return {
                message: otpResult.success
                    ? 'OTP sent successfully'
                    : 'Failed to send OTP',
                retryAfter: otpResult.retryAfter,
                userDetials: registerDto,
            };
        }
        catch (error) {
        }
    }
    async login(loginDto) {
        const user = await this.prisma.user.findFirst({
            where: { phone: loginDto.phonenumber },
        });
        if (!user) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.user_not_found', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        const otpResult = await this.otpService.sendOtp(user.phone);
        return {
            message: otpResult.success
                ? 'OTP sent successfully'
                : 'Failed to send OTP',
            retryAfter: otpResult.retryAfter,
        };
    }
    async verifyOtp(phone, otp, dto) {
        const isValid = await this.otpService.verifyOtp(phone, otp);
        if (!isValid) {
            throw new common_1.ForbiddenException(this.i18n.translate('t.invalid_otp', {
                lang: nestjs_i18n_1.I18nContext.current().lang,
            }));
        }
        let user = await this.prisma.user.findFirst({ where: { phone } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    username: dto.username,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    phone: phone,
                    email: dto.email ?? `${dto.username}@bumou.com`,
                    userType: dto.userType,
                    address: dto.address,
                    city: dto.city,
                    state: dto.state,
                    country: dto.country,
                    schoolName: dto.schoolName,
                    className: dto.className,
                    teacherName: dto.teacherName,
                    local: dto.local,
                    password: "1233",
                },
            });
        }
        const access_token = await this.signToken(user);
        if (dto.Aliyun_token && dto.device_type) {
            await this._registerDevice(dto.Aliyun_token, dto.device_type, user.id);
        }
        return { ...user, access_token };
    }
    async signToken(user) {
        const payload = {
            username: user.username,
            sub: user.id,
            userType: user.userType,
            email: user.email,
        };
        return this.jwt.signAsync(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRATION_TIME'),
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        otp_service_1.OtpService,
        nestjs_i18n_1.I18nService])
], AuthService);
//# sourceMappingURL=auth.service.js.map