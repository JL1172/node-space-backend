import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiKeyVerification implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const api_key = req.headers['api-key'];
    if (!api_key) {
      throw new HttpException('API Key Required', HttpStatus.UNAUTHORIZED);
    } else {
      if (api_key !== process.env.API_KEY) {
        throw new HttpException('Invalid API Key', HttpStatus.UNAUTHORIZED);
      } else {
        next();
      }
    }
  }
}
