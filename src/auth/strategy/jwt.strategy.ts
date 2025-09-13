import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService, private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET')
        })
    }

    async validate(payload: any) {
        console.log('JWT Strategy validate:', {
            sub: payload.sub,
            subType: typeof payload.sub,
            payload
        });
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            },
        });
        console.log('JWT Strategy user found:', {
            userId: user?.id,
            userIdType: typeof user?.id,
            user
        });
        delete user.password;
        return user;
    }
}