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
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  constructor(private readonly watchlistIp: IpAddressLookupProvider) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    try {
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest<Request>();
      const body = request.body;
      const { sub_categories } = body;
      if (sub_categories) {
        sub_categories.forEach((num) => {
          if (isNaN(num)) {
            throw new HttpException(
              'Sub Categories Must Be Number Input',
              HttpStatus.UNPROCESSABLE_ENTITY,
            );
          }
        });
      }
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
        20,
      );
      const errors = Array.isArray(err)
        ? err.map((e) => ({
            [e.property]: e.constraints,
          }))
        : { sub_categories: err.message };
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
      'blog_author_name',
    ];
    keys.forEach((n: string) => {
      body[n] = this.validator.default.escape(body[n]);
      body[n] = this.validator.default.trim(body[n]);
      body[n] = this.validator.default.blacklist(
        body[n],
        /[\x00-\x1F\s;'"<>]/.source,
      );
    });
    body.sub_categories = body.sub_categories.map((n) => {
      n = this.validator.default.escape(n);
      n = this.validator.default.trim(n);
      n = this.validator.default.blacklist(n, /[\x00-\x1F\s;'"<>]/.source);
      return Number(n);
    });
    const sub_cat = {};
    for (const s of body.sub_categories) {
      if (!(s in sub_cat)) sub_cat[s] = s;
    }
    const new_sub = Object.values(sub_cat);
    body.sub_categories = new_sub;
    this.reqStorage.storeReq(request);
    return next.handle();
  }
}

@Injectable()
export class VerifySubCategoriesInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaProvider) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    try {
      const httpContext = context.switchToHttp();
      const body = httpContext.getRequest<Request>().body;
      const { sub_categories, category_id } = body;
      for (const num of sub_categories) {
        const result = await this.prisma.findSubCategory(
          num,
          Number(category_id),
        );
        if (!result) {
          throw new HttpException(
            'Sub Category Error: Incorrect Id Or Reference Error.',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }
      return next.handle();
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
