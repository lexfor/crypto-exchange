export interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  market_data?: {
    current_price: {
      usd: number;
    };
  };
}

export interface CoinGeckoRepositoryConfig {
  coinGecko: {
    baseUrl: string;
    apiKey: string;
  };
}
