import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from '../entities/auth.entity';
import { AuthCommonService } from './auth-common.service';
import { LocalStrategy } from '../strategies/local-auth.strategy';
import { EmailVerificationJwtStrategy } from '../strategies/email-verification-jwt.strategy';
import { RefreshJwtStrategy } from '../strategies/refresh-jwt.strategy';

const AuthStrategies = [
  LocalStrategy,
  EmailVerificationJwtStrategy,
  RefreshJwtStrategy,
];

@Module({
  imports: [TypeOrmModule.forFeature([AuthEntity])],
  controllers: [],
  providers: [AuthCommonService, ...AuthStrategies],
  exports: [AuthCommonService],
})
export class AuthCommonModule {}
