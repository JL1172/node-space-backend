import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { LoginType } from 'src/auth-module/dtos/login-dto';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import * as validator from 'validator';
import { PasswordComparison, UserJwtStorage } from '../providers/login-service';
import rateLimit from 'express-rate-limit';
import * as os from 'node:os';

@Injectable()
export class IpVerificationMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaProvider) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (process.env.STATUS === 'dev') {
        const ipAddress = os.networkInterfaces().wlp48s0[0]?.address;
        const isBlacklisted =
          await this.prisma.findBlacklistedAddress(ipAddress);
        if (isBlacklisted) {
          throw new HttpException('Not Allowed.', HttpStatus.FORBIDDEN);
        } else {
          next();
        }
      } else {
        const ipAddress = req.socket.remoteAddress;
        const isBlacklisted =
          await this.prisma.findBlacklistedAddress(ipAddress);
        if (isBlacklisted) {
          throw new HttpException('Not Allowed.', HttpStatus.FORBIDDEN);
        } else {
          next();
        }
      }
    } catch (err) {
      throw new HttpException(err, HttpStatus.FORBIDDEN);
    }
  }
}

@Injectable()
export class IpAddressLookupMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaProvider) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (process.env.STATUS === 'dev') {
        const ipAddress = os.networkInterfaces().wlp48s0[0]?.address;

        const payload = {
          ip_address: ipAddress,
          created_at: new Date(),
        };
        const result = await this.prisma.handleIpAddresses(payload);
        if (result) {
          throw new HttpException(
            'Too Many Requests, Suspicious Amount Of Attempts.',
            HttpStatus.FORBIDDEN,
          );
        } else {
          next();
        }
      } else {
        const ipAddress = req.socket.remoteAddress;
        const modded_ip = ipAddress.split(' ')[0].replaceAll(',', '');
        const payload = {
          ip_address: modded_ip,
          created_at: new Date(),
        };
        const result = await this.prisma.handleIpAddresses(payload);
        if (result) {
          throw new HttpException(
            'Too Many Requests, Suspicious Amount Of Attempts.',
            HttpStatus.FORBIDDEN,
          );
        } else {
          next();
        }
      }
    } catch (err) {
      throw new HttpException(err, HttpStatus.FORBIDDEN);
    }
  }
}

@Injectable()
export class LoginRateLimiter implements NestMiddleware {
  private limiter = rateLimit({
    limit: 5,
    windowMs: 15 * 60 * 1000,
    handler: () => {
      throw new HttpException(
        'Too Many Login Attempts',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    },
  });
  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}

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
