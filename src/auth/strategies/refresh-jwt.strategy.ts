import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { messages } from '../messages';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<{ userId: string }> {
    const refreshToken = req?.cookies?.refreshToken ?? null;
    if (refreshToken === null) {
      throw new BadRequestException(messages.WRONG_REFRESH_TOKEN);
    }
    const userId = await this.authService.verifyRefreshToken(refreshToken);
    return { userId };
  }
}
