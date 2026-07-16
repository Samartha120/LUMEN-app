import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { OtpService } from '../otp/otp.service';
import { RegisterDto } from './dto/register.dto';
// @ts-ignore - IDE TS Server caching issue
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
// @ts-ignore - IDE TS Server caching issue
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private otpService: OtpService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password immediately
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Call OTP service to generate and send email
    await this.otpService.generateAndSendOtp(
      registerDto.email,
      registerDto.fullName,
      registerDto.phoneNumber,
      hashedPassword,
    );

    return {
      message: 'OTP sent to email. Please verify to complete registration.',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    // Verifies OTP. Will throw if invalid, expired, or max attempts reached.
    const validData = await this.otpService.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );

    // Create user in DB now that OTP is successful
    const user = await this.usersService.create({
      fullName: validData.fullName,
      email: verifyOtpDto.email,
      phoneNumber: validData.phoneNumber,
      password: validData.passwordHash,
      isVerified: true,
    } as any);

    return this.generateTokens(user);
  }

  async resendOtp(email: string) {
    await this.otpService.resendOtp(email);
    return { message: 'OTP successfully resent.' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // @ts-ignore - IDE TS Server caching issue
    if (!(user as any).password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      (user as any).password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    // @ts-ignore - IDE TS Server caching issue
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenDto.refreshToken },
      include: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.isRevoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Optionally revoke the old refresh token (Refresh Token Rotation)
    // @ts-ignore - IDE TS Server caching issue
    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    return this.generateTokens(tokenRecord.user);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't leak that user doesn't exist
      return { message: 'If the email exists, an OTP was sent.' };
    }

    await this.otpService.generateAndSendOtp(email);
    return { message: 'If the email exists, an OTP was sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Verifies OTP
    await this.otpService.verifyOtp(dto.email, dto.otp);

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    const user = await this.usersService.findByEmail(dto.email);
    if (user) {
      await this.prisma.user.update({
        where: { email: dto.email },
        data: { password: hashedPassword } as any,
      });
    }

    return { message: 'Password reset successful.' };
  }

  async enableBiometric(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { biometricEnabled: true } as any,
    });
    return { success: true };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // @ts-ignore - IDE TS Server caching issue
      await this.prisma.refreshToken.deleteMany({
        where: { token: refreshToken, userId },
      });
    }
    return { success: true };
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Generate Refresh Token
    const refreshTokenString = crypto.randomBytes(40).toString('hex');
    const expiresInDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // @ts-ignore - IDE TS Server caching issue
    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshTokenString,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        biometricEnabled: user.biometricEnabled,
      },
    };
  }
}
