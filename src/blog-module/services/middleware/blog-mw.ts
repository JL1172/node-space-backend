import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { BlogPayloadType } from 'src/blog-module/dtos/blog-dtos';
import * as validator from 'validator';

@Injectable()
export class BlogFormValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const result: BlogPayloadType = plainToClass(BlogPayloadType, req.body);
    try {
      await validateOrReject(result, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      next();
    } catch (err) {
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
  constructor() {
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
      'created_at',
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
    next();
  }
}
