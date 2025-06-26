import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationJwtGuard } from '../guards/email-verification-jwt.guard';
import { UserId } from '../../shared/decorators/user-id.decorator';

@ApiTags('auth/email-verification')
@Controller('auth/email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @UseGuards(EmailVerificationJwtGuard)
  @Get()
  async verifyEmail(
    @UserId() userId: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.emailVerificationService.verifyEmail(userId, res);
  }
}
