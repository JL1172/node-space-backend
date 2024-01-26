import { Injectable } from '@nestjs/common';

@Injectable()
export class DecodedTokenStorageService {
  private decodedTokenStorage: any;
  constructor() {
    this.decodedTokenStorage;
  }
  storeDecodedToken(decodedToken: any): void {
    this.decodedTokenStorage = decodedToken;
  }
  readDecodedToken(): typeof this.decodedTokenStorage {
    return this.decodedTokenStorage;
  }
}
