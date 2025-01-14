import { Module } from '@nestjs/common';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';
import { HttpModule } from '@nestjs/axios';
import { coinsRepositoryFactory } from './coins.repository-factory';

@Module({
  imports: [HttpModule],
  controllers: [CoinsController],
  providers: [CoinsService, coinsRepositoryFactory],
})
export class CoinsModule {}
