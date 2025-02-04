import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JWTTokens, SignUpDto } from './auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthEntity } from './entities/auth.entity';
import { UserId } from '../shared/decorators/user-id.decorator';
import { ApiTags } from '@nestjs/swagger';
import { EmailVerificationJwtGuard } from './guards/email-verification-jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() dto: SignUpDto): Promise<AuthEntity> {
    return this.authService.signUp(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  signIn(@UserId() userId: string): Promise<JWTTokens> {
    return this.authService.generateJWTTokens(userId);
  }

  @UseGuards(EmailVerificationJwtGuard)
  @Get('email/verify')
  async verifyEmail(@UserId() userId: string): Promise<void> {
    await this.authService.verifyEmail(userId);
  }
}
