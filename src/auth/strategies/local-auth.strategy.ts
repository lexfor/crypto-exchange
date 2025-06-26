import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCommonService } from '../common/auth-common.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthCommonService) {
    super({ usernameField: 'email' });
  }

  async validate(
    username: string,
    password: string,
  ): Promise<{ userId: string }> {
    const auth = await this.authService.login({ email: username, password });
    if (!auth) {
      throw new UnauthorizedException();
    }
    const user = { userId: auth.user.id };

    return user;
  }
}
