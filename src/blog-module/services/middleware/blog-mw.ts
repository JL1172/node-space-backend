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
import { QueryType } from 'src/blog-module/dtos/blog-dtos';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';

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

@Injectable()
export class ValidateIdQueryMiddleware implements NestMiddleware {
  constructor(private readonly watchlistIp: IpAddressLookupProvider) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const result = plainToClass(QueryType, { id: req.query.id });
    try {
      await validateOrReject(result, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      next();
    } catch (err) {
      await this.watchlistIp.watchlistIpAddress(req, 20);
      const errors = err.map((n) => ({ [n.property]: n.constraints }));
      throw new HttpException(errors, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}

@Injectable()
export class ValidateBlogWithIdExists implements NestMiddleware {
  constructor(private readonly prisma: PrismaProvider) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.prisma.findBlogByIdMinimal(
        Number(req.query.id),
      );
      if (result) {
        next();
      } else {
        throw new HttpException(
          `Could Not Find Blog With Id:${req.query.id}.`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
