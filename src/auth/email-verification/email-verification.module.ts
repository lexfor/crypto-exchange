import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { AuthCommonModule } from '../common/auth-common.module';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationEventsListener } from './events/email-verification.events.listener';

@Module({
  imports: [UsersModule, AuthCommonModule],
  providers: [EmailVerificationService, EmailVerificationEventsListener],
  controllers: [EmailVerificationController],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
