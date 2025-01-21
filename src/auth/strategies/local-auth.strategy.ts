import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
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
    return { userId: auth.user.id };
  }
}
