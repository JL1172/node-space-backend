import { Injectable } from '@nestjs/common';
import {
  HeadersPayloadType,
  RestrictedPayloadStorageType,
} from 'src/auth-module/dtos/restricted-route.dto';

@Injectable()
export class RestrictedJwtService {
  private readonly storage: HeadersPayloadType = { token: '' };
  constructor() {
    this.storage = { token: '' };
  }
  secureStore(token: HeadersPayloadType['token']): void {
    console.log(token);
    this.storage['token'] = token;
  }
  secureRead(): HeadersPayloadType {
    return this.storage;
  }
}

@Injectable()
export class RestrictedPayloadService {
  private payloadStorage: RestrictedPayloadStorageType;
  constructor() {
    this.payloadStorage;
  }
  storePayload(payload: RestrictedPayloadStorageType): void {
    this.payloadStorage = payload;
  }
  readPayload(): typeof this.payloadStorage {
    return this.payloadStorage;
  }
}
