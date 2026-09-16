import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import type {
  Request,
  Response,
} from 'express';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  timezone: string;
};

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,

    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(
      registerDto,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const result =
      await this.authService.login(
        loginDto,
      );

    const {
      accessToken,
      refreshToken,
      ...responseBody
    } = result;

    this.setAuthCookies(
      response,
      accessToken,
      refreshToken,
    );

    return responseBody;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const refreshToken =
      request.cookies?.refresh_token;

    const result =
      await this.authService.refreshSession(
        refreshToken,
      );

    this.setAuthCookies(
      response,
      result.accessToken,
      result.refreshToken,
    );

    return {
      message:
        'Sesión renovada correctamente',

      user:
        result.user,
    };
  }
  @Post('logout')
@HttpCode(HttpStatus.OK)
async logout(
  @Req() request: Request,

  @Res({
    passthrough: true,
  })
  response: Response,
) {
  const refreshToken =
    request.cookies?.refresh_token;

  /*
   * Eliminamos la sesión de MongoDB.
   */
  await this.authService.logoutSession(
    refreshToken,
  );

  /*
   * Después eliminamos las cookies
   * del navegador.
   */
  this.clearAuthCookies(
    response,
  );

  return {
    message:
      'Sesión cerrada correctamente',
  };
}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @Req() request: AuthenticatedRequest,
  ) {
    return request.user;
  }

  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProduction =
      this.configService.get<string>(
        'NODE_ENV',
      ) === 'production';

    const accessTokenExpirationSeconds =
      Number(
        this.configService.get(
          'JWT_EXPIRES_IN_SECONDS',
        ) ?? 900,
      );

    const refreshTokenExpirationDays =
      Number(
        this.configService.get(
          'REFRESH_TOKEN_EXPIRES_IN_DAYS',
        ) ?? 7,
      );

    response.cookie(
      'access_token',
      accessToken,
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',

        maxAge:
          accessTokenExpirationSeconds *
          1000,

        path: '/',
      },
    );

    response.cookie(
      'refresh_token',
      refreshToken,
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',

        maxAge:
          refreshTokenExpirationDays *
          24 *
          60 *
          60 *
          1000,

        path: '/auth',
      },
    );
  }
  private clearAuthCookies(
  response: Response,
) {
  const isProduction =
    this.configService.get<string>(
      'NODE_ENV',
    ) === 'production';

  response.clearCookie(
    'access_token',
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    },
  );

  response.clearCookie(
    'refresh_token',
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/auth',
    },
  );
}
}