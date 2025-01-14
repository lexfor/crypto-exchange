import { ICoin, ICoinWithPrice } from './coins.interface';

export class Coin {
  id: string;
  alias: string;
  name: string;
  price?: number;

  constructor({ id, name, alias }: ICoin) {
    this.id = id;
    this.name = name;
    this.alias = alias;
  }
}

export class CoinWithPrice extends Coin {
  price: number;

  constructor(coinWithPrice: ICoinWithPrice) {
    super(coinWithPrice);
    this.price = coinWithPrice.price;
  }
}
