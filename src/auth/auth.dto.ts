import { AuthEntity } from './entities/auth.entity';
import { PickType } from '@nestjs/swagger';

export enum Token {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export class SignUpDto extends PickType(AuthEntity, ['email', 'password']) {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

export class SignInDto extends PickType(SignUpDto, ['email', 'password']) {}

export class JWTTokens {
  accessToken: string;
  refreshToken: string;
}
