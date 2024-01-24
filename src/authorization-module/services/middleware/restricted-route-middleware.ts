import { Injectable, NestMiddleware } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HeadersPayloadType } from 'src/authorization-module/dtos/restricted-route-dtos';

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
      const error_payload: Record<any, any> = {};
      err.forEach((er) => {
        error_payload[er.property] = er.constraints;
      });
      console.log(error_payload);
      process.exit(1);
    }
  }
}
