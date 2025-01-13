export interface CoinsRepository {
  getAll(): Promise<Coin[]>;
}

export interface Coin {
  id: string;
  alias: string;
  name: string;
  platforms?: object;
}
