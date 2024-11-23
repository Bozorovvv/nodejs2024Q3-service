import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private async generateTokens(userId: string, login: string) {
    const accessToken = jwt.sign(
      { userId, login },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.TOKEN_EXPIRE_TIME },
    );

    const refreshToken = jwt.sign(
      { userId, login },
      process.env.JWT_SECRET_REFRESH_KEY,
      { expiresIn: process.env.TOKEN_REFRESH_EXPIRE_TIME },
    );

    return { accessToken, refreshToken };
  }

  async signup(dto: AuthDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { login: dto.login },
    });

    if (existingUser) {
      throw new ForbiddenException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      Number(process.env.CRYPT_SALT),
    );

    const user = await this.prisma.user.create({
      data: {
        login: dto.login,
        password: hashedPassword,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      },
    });

    const tokens = await this.generateTokens(user.id, user.login);
    return { id: user.id, ...tokens };
  }

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { login: dto.login },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new ForbiddenException('Incorrect password');
    }

    return this.generateTokens(user.id, user.login);
  }

  async refresh(dto: RefreshTokenDto) {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const decoded = jwt.verify(
        dto.refreshToken,
        process.env.JWT_SECRET_REFRESH_KEY,
      ) as {
        userId: string;
        login: string;
        exp: number;
      };

      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTimestamp) {
        throw new ForbiddenException('Refresh token has expired');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      return this.generateTokens(user.id, user.login);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ForbiddenException('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ForbiddenException('Invalid refresh token');
      }
      throw error;
    }
  }
}
