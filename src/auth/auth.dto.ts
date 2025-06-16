import { PickType } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { JWTTokens } from './common/auth-common.dto';

export class SignUpDto extends PickType(AuthEntity, ['email', 'password']) {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

export class SignInDto extends PickType(SignUpDto, ['email', 'password']) {}

export class TokenResponse {
  accessToken: string;
}
