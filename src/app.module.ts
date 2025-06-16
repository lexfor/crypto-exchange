import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { CoinsModule } from './coins/coins.module';
import { UsersModule } from './users/users.module';
import { AuthCommonModule } from './auth/common/auth-common.module';
import { EmailVerificationModule } from './auth/email-verification/email-verification.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    SharedModule,
    CoinsModule,
    UsersModule,
    AuthCommonModule,
    EmailVerificationModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
