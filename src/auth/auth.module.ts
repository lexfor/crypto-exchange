import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthCommonModule } from './common/auth-common.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthEventsService } from './events/auth.events.service';

@Module({
  imports: [UsersModule, AuthCommonModule],
  providers: [AuthService, AuthEventsService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
