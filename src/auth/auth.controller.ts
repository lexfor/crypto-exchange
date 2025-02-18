import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JWTTokens, SignUpDto, TokenResponse } from './auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthEntity } from './entities/auth.entity';
import { UserId } from '../shared/decorators/user-id.decorator';
import { ApiTags } from '@nestjs/swagger';
import { EmailVerificationJwtGuard } from './guards/email-verification-jwt.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import { ConfigService } from '@nestjs/config';
import { AuthControllerConfig } from './auth.interface';

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
    const { accessToken, refreshToken } =
      await this.authService.generateJWTTokens(userId);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.config.cookie.refreshToken.expiresIn,
    });

    return { accessToken };
  }

  @UseGuards(EmailVerificationJwtGuard)
  @Get('email/verify')
  async verifyEmail(
    @UserId() userId: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.verifyEmail(userId, res);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refresh(
    @UserId() userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenResponse> {
    const { accessToken, refreshToken } =
      await this.authService.generateJWTTokens(userId);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.config.cookie.refreshToken.expiresIn,
    });

    return { accessToken };
  }
}
