import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailVerificationJwtStrategy extends PassportStrategy(
  Strategy,
  'email-verification-jwt',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_EMAIL_VERIFICATION_SECRET'),
    });
  }

  async validate(payload: any): Promise<{ userId: string }> {
    return { userId: payload.userId };
  }
}
