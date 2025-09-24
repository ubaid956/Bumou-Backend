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
    const logger = new Logger('AuthService');
    logger.debug('Registering device token for user: ' + userId);

    // Try to find an existing token record for this user and token
    const existing = await this.prisma.userDeviceToken.findFirst({
      where: {
        userId: userId,
        token: Aliyun_token,
      },
    });

    if (!existing) {
      // If a record exists for the user but with a different token, update it.
      const userTokens = await this.prisma.userDeviceToken.findMany({ where: { userId } });
      if (userTokens.length === 0) {
        await this.prisma.userDeviceToken.create({
          data: {
            token: Aliyun_token,
            userId: userId,
            device_type: device_type,
          },
        });
        logger.debug('Token created successfully --> ' + Aliyun_token);
      } else {
        // Update all tokens for this user to the latest value (keeps DB tidy)
        await this.prisma.userDeviceToken.updateMany({
          where: { userId: userId },
          data: {
            device_type: device_type,
            token: Aliyun_token,
          },
        });
        logger.debug('Token(s) updated successfully --> ' + Aliyun_token);
      }
    } else {
      logger.debug('Device token already registered for user: ' + userId);
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

      // Do not create user here. User will be created in verifyOtp after OTP verification.
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
    // Require password for login (no OTP fallback for login path)
    if (!loginDto.password) {
      throw new ForbiddenException(
        this.i18n.translate('t.password_required', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // Ensure user has been OTP-verified
    if (!user.isVerified) {
      throw new ForbiddenException(
        this.i18n.translate('t.user_not_verified', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const validPassword = await argon.verify(user.password, loginDto.password).catch(() => false);
    if (!validPassword) {
      throw new ForbiddenException(
        this.i18n.translate('t.invalid_password', {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // Successful password login: sign token and register device if provided
    const access_token = await this.signToken(user);

    if (loginDto.Aliyun_token && loginDto.device_type) {
      await this._registerDevice(loginDto.Aliyun_token, loginDto.device_type, user.id);
    }

    // delete sensitive fields before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = (user as any);
    return { ...safeUser, access_token };
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
      // Hash password if provided, otherwise generate a random password
      const rawPassword = dto.password ?? Math.random().toString(36).slice(-8);
      const hashed = await argon.hash(rawPassword);

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
          password: hashed,
          isVerified: true, // mark as verified after successful OTP
        },
      });

      // NOTE: If we generated a password, consider returning it in a secure channel or prompting user to set one.
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
