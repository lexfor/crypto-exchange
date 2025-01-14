import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CoinsRepository } from './coins.interface';
import { ApplicationRepository } from '../constants';
import { CoinGeckoCoinsRepository } from '../coin-gecko/coins/coin-gecko.coins.repository';
import { FactoryProvider } from '@nestjs/common';

export const coinsRepositoryFactory: FactoryProvider<CoinsRepository> = {
  provide: 'COINS_REPOSITORY',
  useFactory: (configService: ConfigService, httpService: HttpService) => {
    const applicationRepository = configService.get<ApplicationRepository>(
      'APPLICATION_REPOSITORY',
    );
    switch (applicationRepository) {
      case ApplicationRepository.CoinGecko:
        return new CoinGeckoCoinsRepository(configService, httpService);
      default:
        return new CoinGeckoCoinsRepository(configService, httpService);
    }
  },
  inject: [ConfigService, HttpService],
};
