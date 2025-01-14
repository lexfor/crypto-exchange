export interface CoinsRepository {
  getAll(): Promise<ICoin[]>;
  getById(id: string): Promise<ICoinWithPrice>;
}

export interface ICoin {
  id: string;
  alias: string;
  name: string;
}

export interface ICoinWithPrice extends ICoin {
  price: number;
}
