import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto, TokenResponse } from './auth.dto';
import { AuthEntity } from './entities/auth.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserId } from '../shared/decorators/user-id.decorator';
import { ConfigService } from '@nestjs/config';
import { AuthControllerConfig } from './auth.interface';
import { Response } from 'express';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private config: AuthControllerConfig;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.config = {
      cookie: {
        refreshToken: {
          expiresIn: this.configService.get('COOKIE_REFRESH_TOKEN_EXPIRES_IN'),
        },
      },
    };
  }

  @Post('sign-up')
  signUp(@Body() dto: SignUpDto): Promise<AuthEntity> {
    return this.authService.signUp(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(
    @UserId() userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenResponse> {
    const { accessToken, refreshToken } = await this.authService.signIn(userId);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.config.cookie.refreshToken.expiresIn,
    });

    return { accessToken };
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refresh(
    @UserId() userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenResponse> {
    const { accessToken, refreshToken } = await this.authService.signIn(userId);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.config.cookie.refreshToken.expiresIn,
    });

    return { accessToken };
  }
}
