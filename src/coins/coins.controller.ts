import { Controller, Get, Param } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { Coin, CoinWithPrice } from './coins.dto';

@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  @Get('all')
  getAll(): Promise<Coin[]> {
    return this.coinsService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<CoinWithPrice> {
    return this.coinsService.getById(id);
  }
}
