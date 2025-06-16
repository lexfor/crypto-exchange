import { OmitType } from '@nestjs/swagger';
import { SignUpDto } from '../auth.dto';
import { UsersEntity } from '../../users/entities/users.entity';

export enum Token {
  ACCESS = 'access',
  REFRESH = 'refresh',
  EMAIL_VERIFICATION = 'emailVerification',
}

export class JWTTokens {
  accessToken: string;
  refreshToken: string;
}

export class CreateAuthDto extends OmitType(SignUpDto, [
  'username',
  'fullName',
]) {
  user: UsersEntity;
}

export class TokenPayload {
  userId: string;
}
