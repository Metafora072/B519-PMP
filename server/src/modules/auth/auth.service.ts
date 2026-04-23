import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException("该邮箱已注册");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: normalizedEmail,
      name: dto.name.trim(),
      passwordHash,
    });

    return {
      user,
      accessToken: await this.signToken({
        sub: user.id.toString(),
        email: user.email,
      }),
    };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException("邮箱或密码错误");
    }

    const passwordMatched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatched) {
      throw new UnauthorizedException("邮箱或密码错误");
    }

    const profile = await this.usersService.findProfileById(user.id);
    if (!profile) {
      throw new UnauthorizedException("用户不存在");
    }

    return {
      user: profile,
      accessToken: await this.signToken({
        sub: profile.id.toString(),
        email: profile.email,
      }),
    };
  }

  async getProfile(userId: string) {
    const profile = await this.usersService.findProfileById(BigInt(userId));

    if (!profile) {
      throw new UnauthorizedException("登录状态无效");
    }

    return profile;
  }

  getCookieName() {
    return this.configService.get<string>("auth.cookieName", "pmp_access_token");
  }

  getCookieOptions() {
    return {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: this.configService.get<boolean>("auth.cookieSecure", false),
      path: "/",
      maxAge: this.parseJwtMaxAge(this.configService.get<string>("auth.jwtExpiresIn", "7d")),
    };
  }

  async signToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }

  private parseJwtMaxAge(expiresIn: string) {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2];
    const factor =
      unit === "s"
        ? 1000
        : unit === "m"
          ? 60 * 1000
          : unit === "h"
            ? 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;

    return value * factor;
  }
}
