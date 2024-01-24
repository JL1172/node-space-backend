import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { RegisterBody } from 'src/authentication-module/dtos/register-dto';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import * as validator from 'validator';
import { PasswordService } from '../providers/register-service';

@Injectable()
export class RegisterValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const result: RegisterBody = plainToClass(RegisterBody, req.body);
    try {
      await validateOrReject(result, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      next();
    } catch (err: any) {
      const returnObject: Record<string | symbol, string> = {};
      err.forEach((n: any) => {
        const prop = n.property;
        returnObject[prop] = n.constraints;
      });
      throw new HttpException(returnObject, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}

@Injectable()
export class RegisterSanitationMiddleware implements NestMiddleware {
  private readonly validator = validator;
  constructor() {
    this.validator = validator;
  }
  use(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    const keys: string[] = [
      'first_name',
      'last_name',
      'email',
      'username',
      'password',
      'role',
    ];
    keys.forEach((n: string) => {
      body[n] = this.validator.default.escape(body[n]);
      body[n] = this.validator.default.trim(body[n]);
      body[n] = this.validator.default.blacklist(
        body[n],
        /[\x00-\x1F\s;'"\\<>]/.source,
      );
    });
    body.email = this.validator.default.normalizeEmail(body.email);
    next();
  }
}

@Injectable()
export class VerifyUserUnique implements NestMiddleware {
  constructor(private readonly prisma: PrismaProvider) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const [firstResult, secondResult] = await this.prisma.findUser(
        req.body.username,
        req.body.email,
      );
      if (!firstResult || !secondResult) {
        throw new HttpException(
          `${
            !firstResult && secondResult
              ? 'Username'
              : firstResult && !secondResult
                ? 'Email'
                : 'Username and Email'
          } Not Unique.`,
          HttpStatus.BAD_REQUEST,
        );
      } else {
        next();
      }
    } catch (err) {
      throw new HttpException(
        `Error Verifying Uniqueness Of User: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

@Injectable()
export class HashPasswordMiddleware implements NestMiddleware {
  constructor(private readonly passwordService: PasswordService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const hashedPassword: string = await this.passwordService.hashPassword(
        req.body.password,
      );
      req.body.password = hashedPassword;
      next();
    } catch (err) {
      throw new HttpException(
        `Error Processing Password: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
