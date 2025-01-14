import { Inject, Injectable } from '@nestjs/common';
import { CoinsRepository } from './coins.interface';
import { Coin, CoinWithPrice } from './coins.dto';

@Injectable()
export class CoinsService {
  constructor(
    @Inject('COINS_REPOSITORY') private readonly repository: CoinsRepository,
  ) {}

  async getAll(): Promise<Coin[]> {
    const coins = await this.repository.getAll();
    return coins.map((coin) => {
      return new Coin(coin);
    });
  }

  async getById(id: string) {
    const coin = await this.repository.getById(id);
    return new CoinWithPrice(coin);
  }
}
