import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local-auth.strategy';
import { EmailVerificationJwtStrategy } from './strategies/email-verification-jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEntity]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, EmailVerificationJwtStrategy],
})
export class AuthModule {}
