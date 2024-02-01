import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Request } from 'express';
import { BlogPayloadType } from 'src/blog-module/dtos/blog-dtos';
import * as validator from 'validator';
import { ReqStorageProvider } from '../providers/blog-provider';
import { IpAddressLookupProvider } from 'src/auth-module/services/providers/login-service';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  constructor(private readonly watchlistIp: IpAddressLookupProvider) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    try {
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest<Request>();
      const body = request.body;

      const result = plainToClass(BlogPayloadType, body);
      await validateOrReject(result, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      return next.handle();
    } catch (err) {
      const httpContext = context.switchToHttp();
      await this.watchlistIp.watchlistIpAddress(
        httpContext.getRequest<Request>(),
        15,
      );
      const errors = err.map((e) => ({ [e.property]: e.constraints }));
      throw new HttpException(errors, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}

@Injectable()
export class SanitationInterceptor implements NestInterceptor {
  private readonly validator = validator;
  constructor(private readonly reqStorage: ReqStorageProvider) {}
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const body = request.body;
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
    this.reqStorage.storeReq(request);
    return next.handle();
  }
}
