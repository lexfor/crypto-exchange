import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local-auth.strategy';
import { EmailVerificationJwtStrategy } from './strategies/email-verification-jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';

const strategies = [
  LocalStrategy,
  EmailVerificationJwtStrategy,
  RefreshJwtStrategy,
];

@Module({
  imports: [TypeOrmModule.forFeature([AuthEntity]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, ...strategies],
})
export class AuthModule {}
