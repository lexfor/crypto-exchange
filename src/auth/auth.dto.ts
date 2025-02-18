import { AuthEntity } from './entities/auth.entity';
import { PickType } from '@nestjs/swagger';
import { UsersEntity } from '../users/entities/users.entity';

export enum Token {
  ACCESS = 'access',
  REFRESH = 'refresh',
  EMAIL_VERIFICATION = 'emailVerification',
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

export class SendEmailVerificationDto {
  userId: string;
  email: string;
  fullName: string;
}

export class TokenResponse extends PickType(JWTTokens, ['accessToken']) {}

export class TokenPayload {
  userId: string;
}
