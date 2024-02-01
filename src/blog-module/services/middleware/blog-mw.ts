import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { IpAddressLookupProvider } from 'src/auth-module/services/providers/login-service';
import { BlogPayloadType } from 'src/blog-module/dtos/blog-dtos';
import * as validator from 'validator';
import { ReqStorageProvider } from '../providers/blog-provider';

@Injectable()
export class RateLimitMiddlewareBlog implements NestMiddleware {
  constructor(private readonly watchlistIp: IpAddressLookupProvider) {}
  private readonly rateLimit = rateLimit({
    limit: 15,
    windowMs: 1000 * 60 * 10,
    handler: (req) => {
      this.watchlistIp.watchlistIpAddress(req, 20);
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    },
  });
  use(req: Request, res: Response, next: NextFunction) {
    this.rateLimit(req, res, next);
  }
}
//below is not being used;
@Injectable()
export class BlogFormValidationMiddleware implements NestMiddleware {
  constructor(private readonly watchlistIp: IpAddressLookupProvider) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const result: BlogPayloadType = plainToClass(BlogPayloadType, req.body);
    try {
      await validateOrReject(result, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      next();
    } catch (err) {
      await this.watchlistIp.watchlistIpAddress(req, 15);
      const errReturnObject = err.map((n) => ({
        [n.property]: n.constraints,
      }));
      throw new HttpException(errReturnObject, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}

@Injectable()
export class BlogFormSanitationMiddleware implements NestMiddleware {
  private readonly validator = validator;
  constructor(private readonly reqStorage: ReqStorageProvider) {
    this.validator = validator;
  }
  use(req: Request, res: Response, next: NextFunction) {
    const body: BlogPayloadType = req.body;
    const keys = [
      'blog_title',
      'blog_intro',
      'blog_body',
      'blog_outro',
      'blog_summary',
      // 'user_id',
      'blog_author_name',
      // 'category_id',
    ];
    keys.forEach((n: string) => {
      body[n] = this.validator.default.escape(body[n]);
      body[n] = this.validator.default.trim(body[n]);
      body[n] = this.validator.default.blacklist(
        body[n],
        /[\x00-\x1F\s;'"<>]/.source,
      );
    });
    body.SubCategory = body.SubCategory.map((n) => {
      n = this.validator.default.escape(n);
      n = this.validator.default.trim(n);
      n = this.validator.default.blacklist(n, /[\x00-\x1F\s;'"<>]/.source);
      return n;
    });
    this.reqStorage.storeReq(req);
    next();
  }
}
