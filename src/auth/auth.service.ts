import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService, I18nContext, logger } from 'nestjs-i18n';
import { OtpService } from 'src/otp/otp.service';
import { VerifyOtpDto } from './dto/otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private otpService: OtpService, // inject OtpService here

    private readonly i18n: I18nService,
  ) { }

  verifyJwt(jwt: string): Promise<any> {
    return this.jwt.verifyAsync(jwt, {
      secret: this.config.get<string>('JWT_SECRET'),
    });
  }

  async getCurrentUser(user: User) {
    const access_token = await this.signToken(user);
    // await this._registerDevice( user.id);

    return { ...user, access_token };
  }

  async _registerDevice(Aliyun_token: string, device_type: string, userId: string) {

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

    const logger = new Logger('AuthService');
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
    } else {
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

  async isUsernameAvailable(username: string) {
    const user = await this.prisma.user.findFirst({ where: { username } });
    return { isAvailable: !user };
  }

  async isEmailAvailable(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    return { isAvailable: !user };
  }

  async isPhoneAvailable(phone: string) {
    const user = await this.prisma.user.findFirst({ where: { phone } });
    return { isAvailable: !user };
  }

  // async register(registerDto: RegisterDto) {
  //   try {
  //     if (
  //       !registerDto.email ||
  //       registerDto.email == null ||
  //       registerDto.email === ''
  //     ) {
  //       registerDto.email = registerDto.username + '@bumou.com';
  //     }
  //     // delete withoutTokenData.pushy_token;

  //     // const user = await this.prisma.user.create({
  //     //   data: {
  //     //     ...withoutTokenData,

  //     //   },
  //     // });
  //     const otpResult = await this.otpService.sendOtp(registerDto.phone);
  //     console.log('Phone Number: ', registerDto.phone);
  //     // const access_token = await this.signToken(user);
  //     return {
  //       message: otpResult.success
  //         ? 'OTP sent successfully'
  //         : 'Failed to send OTP',
  //       retryAfter: otpResult.retryAfter,
  //       userDetials: registerDto,
  //     };

  //     // await this._registerDevice(registerDto.Aliyun_token, registerDto.device_type, user.id);
  //     // return { ...user, access_token };
  //   } catch (error) {
  //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //       if (error.code === 'P2002') {
  //         throw new ForbiddenException(
  //           this.i18n.translate('t.user_already_exists', {
  //             lang: I18nContext.current().lang,
  //           }),
  //         );
  //       }
  //     }
  //     throw error;
  //   }
  // }

  // async login(loginDto: LoginDto) {
  //   console.log('loginDto is : ', loginDto);
  //   const user = await this.prisma.user.findFirst({
  //     where: {
  //       OR: [
  //         { phone: loginDto.phonenumber },
  //       ],
  //     },
  //   });
  //   if (!user) {
  //     throw new ForbiddenException(
  //       this.i18n.translate('t.user_not_found', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }

  //   const otpResult = await this.otpService.sendOtp(user.phone);
  //   // const validPassword = await argon.verify(user.password, loginDto.password);
  //   // if (!validPassword) {
  //   //   throw new ForbiddenException(
  //   //     this.i18n.translate('t.invalid_password', {
  //   //       lang: I18nContext.current().lang,
  //   //     }),
  //   //   );
  //   // }
  //   // delete user.password;


  //   return {
  //     message: otpResult.success
  //       ? 'OTP sent successfully'
  //       : 'Failed to send OTP',
  //     retryAfter: otpResult.retryAfter,
  //   };

  //   // const access_token = await this.signToken(user);

  //   // console.log('token is : ', loginDto.Aliyun_token);

  //   // await this._registerDevice(loginDto.Aliyun_token, loginDto.device_type, user.id);

  //   // return { ...user, access_token };
  // }


  async register(registerDto: RegisterDto) {
    try {
      // Check if phone number is already registered
      const existingUser = await this.prisma.user.findFirst({
        where: { phone: registerDto.phone },
      });

      if (existingUser) {
        throw new ForbiddenException(
          'This Phone number is already Register try again with another one',
        );
      }

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
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // handle other Prisma errors
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { phone: loginDto.phonenumber },
    });
    if (!user) {
      throw new ForbiddenException(
        this.i18n.translate('t.user_not_found', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const otpResult = await this.otpService.sendOtp(user.phone);

    return {
      message: otpResult.success
        ? 'OTP sent successfully'
        : 'Failed to send OTP',
      retryAfter: otpResult.retryAfter,
    };
  }


  // async verifyOtp(phone: string, otp: string, dto: VerifyOtpDto) {
  //   const isValid = await this.otpService.verifyOtp(phone, otp);
  //   if (!isValid) {
  //     throw new ForbiddenException(
  //       this.i18n.translate('t.invalid_otp', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }

  //   const user = await this.prisma.user.findFirst({
  //     where: { phone },
  //   });
  //   if (!user) {
  //     // Register new user if not found
  //     throw new ForbiddenException(
  //       this.i18n.translate('t.user_not_found', {
  //         lang: I18nContext.current().lang,
  //       }),
  //     );
  //   }

  //   const access_token = await this.signToken(user);

  //   console.log('token is : ', dto.Aliyun_token);

  //   await this._registerDevice(dto.Aliyun_token, dto.device_type, user.id);

  //   return { ...user, access_token };
  // }

  async verifyOtp(phone: string, otp: string, dto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(phone, otp);
    if (!isValid) {
      throw new ForbiddenException(
        this.i18n.translate('t.invalid_otp', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    let user = await this.prisma.user.findFirst({ where: { phone } });

    if (!user) {
      // Register new user if not found
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



  async signToken(user: User): Promise<string> {
    const payload = {
      username: user.username,
      sub: user.id,
      userType: user.userType,
      email: user.email,
    };
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRATION_TIME'),
    });
  }
}
