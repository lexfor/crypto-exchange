import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { CoinsModule } from './coins/coins.module';

@Module({
  imports: [SharedModule, CoinsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
