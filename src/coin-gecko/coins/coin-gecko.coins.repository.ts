import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Coin, CoinsRepository } from '../../coins/coins.interface';
import { lastValueFrom } from 'rxjs';
import { AUTH_HEADER_NAME } from '../constants';
import {
  CoinGeckoCoin,
  CoinGeckoRepositoryConfig,
} from './coin-gecko.coins.interface';

@Injectable()
export class CoinGeckoCoinsRepository implements CoinsRepository {
  private readonly config: CoinGeckoRepositoryConfig;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.config = {
      coinGecko: {
        baseUrl: this.configService.get('COIN_GECKO_API_BASE_URL'),
        apiKey: this.configService.get('COIN_GECKO_API_KEY'),
      },
    };
  }

  async getAll() {
    const res = await lastValueFrom(
      this.httpService.get<CoinGeckoCoin[], any>(
        `${this.config.coinGecko.baseUrl}/coins/list`,
        {
          headers: this.formAuthHeaders(),
        },
      ),
    );
    return CoinGeckoCoinsRepository.transformToSimpleCoins(res.data);
  }

  formAuthHeaders() {
    return {
      [AUTH_HEADER_NAME]: this.config.coinGecko.apiKey,
    };
  }

  static transformToSimpleCoins(rawData: CoinGeckoCoin[]): Coin[] {
    return rawData.map((coinGeckoCoin) => {
      const { symbol } = coinGeckoCoin;
      return {
        ...coinGeckoCoin,
        alias: symbol,
      };
    });
  }
}
