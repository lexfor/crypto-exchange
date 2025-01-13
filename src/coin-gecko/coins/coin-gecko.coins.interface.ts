export interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  platforms?: object;
}

export interface CoinGeckoRepositoryConfig {
  coinGecko: {
    baseUrl: string;
    apiKey: string;
  };
}
