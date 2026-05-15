import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const userSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
        name: dto.name.trim(),
        phone: dto.phone?.trim() || undefined,
      },
      select: userSelect,
    });

    return { data: user, message: 'User registered successfully' };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const safeUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: userSelect,
    });

    return {
      data: {
        user: safeUser,
        tokens: this.createTokens(user.id, user.email, user.role),
      },
      message: 'Login successful',
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: string;
      }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
      });

      return {
        data: this.createTokens(payload.sub, payload.email, payload.role),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout() {
    return { message: 'Logout successful' };
  }

  private createTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessTokenExpiresIn = (process.env.JWT_EXPIRES_IN || '15m') as JwtSignOptions['expiresIn'];
    const refreshTokenExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as JwtSignOptions['expiresIn'];

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'dev-secret-change-me',
        expiresIn: accessTokenExpiresIn,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
        expiresIn: refreshTokenExpiresIn,
      }),
    };
  }
}
