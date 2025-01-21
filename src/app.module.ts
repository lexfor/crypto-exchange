import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { CoinsModule } from './coins/coins.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [SharedModule, CoinsModule, UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
