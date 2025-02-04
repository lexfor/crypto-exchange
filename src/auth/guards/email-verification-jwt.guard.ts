import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class EmailVerificationJwtGuard extends AuthGuard(
  'email-verification-jwt',
) {}
