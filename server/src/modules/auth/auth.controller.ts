import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(dto);
    response.cookie(
      this.authService.getCookieName(),
      result.accessToken,
      this.authService.getCookieOptions(),
    );

    return {
      user: result.user,
    };
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    response.cookie(
      this.authService.getCookieName(),
      result.accessToken,
      this.authService.getCookieOptions(),
    );

    return {
      user: result.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: { id: string }) {
    return this.authService.getProfile(user.id);
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(this.authService.getCookieName(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return {
      message: "退出成功",
    };
  }
}

