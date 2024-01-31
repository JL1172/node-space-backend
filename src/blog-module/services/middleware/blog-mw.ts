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
