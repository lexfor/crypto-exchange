import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ICoin,
  CoinsRepository,
  ICoinWithPrice,
} from '../../coins/coins.interface';
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

  async getAll(): Promise<ICoin[]> {
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

  async getById(id: string): Promise<ICoinWithPrice> {
    const res = await lastValueFrom(
      this.httpService.get<CoinGeckoCoin, any>(
        `${this.config.coinGecko.baseUrl}/coins/${id}`,
        {
          headers: this.formAuthHeaders(),
        },
      ),
    );
    return CoinGeckoCoinsRepository.transformToSimpleCoinsWithPrice([
      res.data,
    ]).pop();
  }

  formAuthHeaders() {
    return {
      [AUTH_HEADER_NAME]: this.config.coinGecko.apiKey,
    };
  }

  static transformToSimpleCoins(rawData: CoinGeckoCoin[]): ICoin[] {
    return rawData.map((coinGeckoCoin) => {
      const { symbol } = coinGeckoCoin;
      return {
        ...coinGeckoCoin,
        alias: symbol,
      };
    });
  }

  static transformToSimpleCoinsWithPrice(
    rawData: CoinGeckoCoin[],
  ): ICoinWithPrice[] {
    return rawData.map((coinGeckoCoin) => {
      const { symbol } = coinGeckoCoin;
      return {
        ...coinGeckoCoin,
        alias: symbol,
        price: coinGeckoCoin?.market_data?.current_price?.usd ?? null,
      };
    });
  }
}
