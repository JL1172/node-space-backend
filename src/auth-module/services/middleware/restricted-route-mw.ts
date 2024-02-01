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
import { DecodedTokenStorageService } from 'src/global-utils/global-services/providers/DecodedTokenStorage';
import rateLimit from 'express-rate-limit';
import { IpAddressLookupProvider } from '../providers/login-service';

@Injectable()
export class RestrictedRouteRateLimitMiddleware implements NestMiddleware {
  private limiter = rateLimit({
    limit: 50,
    windowMs: 1000 * 60 * 15,
    handler: () => {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    },
  });
  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}

@Injectable()
export class RestrictedRouteValidation implements NestMiddleware {
  constructor(private readonly watchlistIp: IpAddressLookupProvider) {}
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
      await this.watchlistIp.watchlistIpAddress(req, 20);
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
  constructor(
    private readonly jwtStorage: RestrictedJwtService,
    private readonly watchlistIp: IpAddressLookupProvider,
  ) {
    this.validator = validator;
  }
  async use(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (err) {
      await this.watchlistIp.watchlistIpAddress(req, 20);
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

@Injectable()
export class VerifyJwtValidationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtStorage: RestrictedJwtService,
    private readonly jwtVerification: JwtProvider,
    private readonly payloadStorage: RestrictedPayloadService,
    private readonly decodedTokenStorage: DecodedTokenStorageService,
    private readonly watchlistIp: IpAddressLookupProvider,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { token }: HeadersPayloadType = this.jwtStorage.secureRead();
      await this.jwtVerification.jwtVerification(token);
      const result = await this.decodedTokenStorage.readDecodedToken();
      this.payloadStorage.storePayload({
        username: result.username,
        email: result.email,
        id: result.id,
        subject: result.subject,
      });
      next();
    } catch (err: unknown | any) {
      await this.watchlistIp.watchlistIpAddress(req, 20);
      throw new HttpException({ authorized: false, error: err }, err.status);
    }
  }
}
