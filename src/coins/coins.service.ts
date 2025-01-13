import { Inject, Injectable } from '@nestjs/common';
import { CoinsRepository } from './coins.interface';

@Injectable()
export class CoinsService {
  constructor(
    @Inject('COINS_REPOSITORY') private readonly repository: CoinsRepository,
  ) {}

  getAll() {
    return this.repository.getAll();
  }
}
