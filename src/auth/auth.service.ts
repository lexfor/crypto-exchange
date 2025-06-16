import { Injectable } from '@nestjs/common';
import { AuthCommonService } from './common/auth-common.service';
import { UsersService } from '../users/users.service';
import { AuthEntity } from './entities/auth.entity';
import { SignUpDto } from './auth.dto';
import { JWTTokens } from './common/auth-common.dto';
import { AuthEventsService } from './events/auth.events.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authCommonService: AuthCommonService,
    private readonly usersService: UsersService,
    private readonly authEventsService: AuthEventsService,
  ) {}

  async signUp(dto: SignUpDto): Promise<AuthEntity> {
    const { username, fullName } = dto;
    const user = await this.usersService.create({ username, fullName });
    const auth = await this.authCommonService.create({ ...dto, user });
    this.authEventsService.publishUserFinishSignUpEvent(auth);
    return auth;
  }

  async signIn(userId: string): Promise<JWTTokens> {
    return this.authCommonService.generateJWTTokens(userId);
  }
}
