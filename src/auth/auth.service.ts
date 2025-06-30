import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthCommonService } from './common/auth-common.service';
import { UsersService } from '../users/users.service';
import { AuthEntity } from './entities/auth.entity';
import { SignUpDto } from './auth.dto';
import { JWTTokens } from './common/auth-common.dto';
import { AuthEventsService } from './events/auth.events.service';
import { AuthServiceConfig } from './auth.interface';
import { ConfigService } from '@nestjs/config';
import { TypeHelper } from '../shared/helpers/type.helper';

@Injectable()
export class AuthService {
  private config: AuthServiceConfig;
  constructor(
    private readonly configService: ConfigService,
    private readonly authCommonService: AuthCommonService,
    private readonly usersService: UsersService,
    private readonly authEventsService: AuthEventsService,
  ) {
    this.config = {
      signUp: {
        featureFlag: TypeHelper.booleanStringToString(
          this.configService.get('SIGN_UP_FEATURE_FLAG'),
        ),
      },
      signIn: {
        featureFlag: TypeHelper.booleanStringToString(
          this.configService.get('SIGN_IN_FEATURE_FLAG'),
        ),
      },
    };
  }

  async signUp(dto: SignUpDto): Promise<AuthEntity> {
    if (!this.config.signUp.featureFlag) {
      throw new ForbiddenException();
    }
    const { username, fullName } = dto;
    const user = await this.usersService.create({ username, fullName });
    const auth = await this.authCommonService.create({ ...dto, user });
    this.authEventsService.publishUserFinishSignUpEvent(auth);
    return auth;
  }

  async signIn(userId: string): Promise<JWTTokens> {
    if (!this.config.signIn.featureFlag) {
      throw new ForbiddenException();
    }
    return this.authCommonService.generateJWTTokens(userId);
  }
}
