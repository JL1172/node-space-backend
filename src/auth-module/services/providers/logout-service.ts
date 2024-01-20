import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStorage {
  private exp: number = 0;
  constructor() {
    this.exp = 0;
  }
  storeExp(expiration_date): void {
    this.exp = expiration_date;
  }
  readExp() {
    return this.exp;
  }
}
