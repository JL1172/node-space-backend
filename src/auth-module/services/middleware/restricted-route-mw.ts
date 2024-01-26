import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

import * as validator from 'validator';
import {
  RestrictedJwtService,
  RestrictedPayloadService,
} from '../providers/restricted-route-service';
import { JwtProvider } from 'src/global-utils/global-services/providers/JwtProvider';
import { HeadersPayloadType } from 'src/auth-module/dtos/restricted-route.dto';

@Injectable()
export class RestrictedRouteValidation implements NestMiddleware {
  constructor() {}
  async use(req: Request, res: Response, next: NextFunction) {
    const result = plainToClass(HeadersPayloadType, {
      token: req.headers.authorization,
    });
    try {
      await validateOrReject(result, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      next();
    } catch (err: any | unknown) {
      const error_payload: string[] = Object.values(err[0].constraints);
      throw new HttpException(
        { authorized: false, error: error_payload },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}

@Injectable()
export class RestrictedRouteSanitation implements NestMiddleware {
  private readonly validator = validator;
  constructor(private readonly jwtStorage: RestrictedJwtService) {
    this.validator = validator;
  }
  use(req: Request, res: Response, next: NextFunction) {
    req.headers.authorization = this.validator.default.escape(
      req.headers.authorization,
    );
    req.headers.authorization = this.validator.default.trim(
      req.headers.authorization,
    );
    req.headers.authorization = this.validator.default.blacklist(
      req.headers.authorization,
      /[\x00-\x1F\s;'"\\<>]/.source,
    );
    const token = req.headers.authorization;
    this.jwtStorage.secureStore(token);
    next();
  }
}

@Injectable()
export class VerifyJwtValidationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtStorage: RestrictedJwtService,
    private readonly jwtVerification: JwtProvider,
    private readonly payloadStorage: RestrictedPayloadService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { token }: HeadersPayloadType = this.jwtStorage.secureRead();
      const result = await this.jwtVerification.jwtVerification(token);
      this.payloadStorage.storePayload({
        username: result.username,
        email: result.email,
      });
      next();
    } catch (err: unknown | any) {
      throw new HttpException({ authorized: false, error: err }, err.status);
    }
  }
}
