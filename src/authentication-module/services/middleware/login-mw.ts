import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { LoginType } from 'src/authentication-module/dtos/login-dto';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import * as validator from 'validator';
import { PasswordComparison, UserJwtStorage } from '../providers/login-service';

@Injectable()
export class LoginBodyValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const result = plainToClass(LoginType, req.body);
    try {
      await validateOrReject(result, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      next();
    } catch (err) {
      const payload = {};
      err.forEach((n) => {
        payload[n.property] = n.constraints;
      });
      throw new HttpException(payload, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}

@Injectable()
export class LoginBodySanitationMiddleware implements NestMiddleware {
  private readonly validator = validator;
  constructor() {
    this.validator = validator;
  }
  use(req: Request, res: Response, next: NextFunction) {
    const keys: string[] = ['username', 'password'];
    keys.forEach((n) => {
      req.body[n] = this.validator.default.escape(req.body[n]);
      req.body[n] = this.validator.default.trim(req.body[n]);
      req.body[n] = this.validator.default.blacklist(
        req.body[n],
        /[\x00-\x1F\s;'"\\<>]/.source,
      );
    });
    next();
  }
}

@Injectable()
export class VerifyUserExitsMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaProvider,
    private readonly passwordService: PasswordComparison,
    private readonly userStorageService: UserJwtStorage,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const result = await this.prisma.findUserForLogin(req.body.username);
    if (result) {
      this.passwordService.storePassword(result.password);
      this.userStorageService.storeUser(result);
      next();
    } else {
      throw new HttpException(
        'Invalid Username or Password',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

@Injectable()
export class VerifyPasswordCorrectMiddleware implements NestMiddleware {
  constructor(private readonly passwordService: PasswordComparison) {}
  async use(req: Request, res: Response, next: NextFunction) {
    await this.passwordService.comparePassword(req.body.password);
    next();
  }
}
