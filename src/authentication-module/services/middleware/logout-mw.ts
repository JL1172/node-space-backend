import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import {
  LogoutBody,
  PayloadBody,
} from 'src/authentication-module/dtos/logout-dto';
import { JwtProvider } from 'src/global-utils/global-services/providers/JwtProvider';
import validator from 'validator';
import { JwtStorage } from '../providers/logout-service';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';

@Injectable()
export class LogoutValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const output = plainToClass(LogoutBody, {
      token: req.headers.authorization,
    });
    try {
      await validateOrReject(output, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      next();
    } catch (err) {
      const result = {};
      err.forEach((n) => {
        result[n.property] = n.constraints;
      });
      throw new HttpException(result, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}

@Injectable()
export class LogoutSanitationMiddleware implements NestMiddleware {
  private readonly validator = validator;
  constructor() {
    this.validator = validator;
  }
  use(req: Request, res: Response, next: NextFunction) {
    let token: string = req.headers.authorization;
    token = this.validator.default.escape(token);
    token = this.validator.default.trim(token);
    token = this.validator.default.blacklist(
      token,
      /[\x00-\x1F\s;'"\\<>]/.source,
    );
    req.headers.authorization = token;
    next();
  }
}

@Injectable()
export class VerifyJwtUnique implements NestMiddleware {
  constructor(private readonly prisma: PrismaProvider) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.prisma.findJwt(req.headers.authorization);
      if (result) {
        throw new HttpException('Token Not Unique', HttpStatus.BAD_REQUEST);
      } else {
        next();
      }
    } catch (err) {
      throw new HttpException(
        `Error Verifying Token's Uniqueness: ${err}`,
        err.status,
      );
    }
  }
}

@Injectable()
export class VerifyJwtValidMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtProvider,
    private readonly jwtStorage: JwtStorage,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const { exp } = await this.jwt.jwtVerification(req.headers.authorization);
    this.jwtStorage.storeExp(exp);
    next();
  }
}

@Injectable()
export class BlacklistJwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtStorage: JwtStorage,
    private readonly prisma: PrismaProvider,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const exp = this.jwtStorage.readExp();
      const exp_date = new Date(1000 * exp);
      const payload: PayloadBody = {
        jwt: req.headers.authorization,
        expiration_time: exp_date,
      };
      await this.prisma.blackListJwt(payload);
      next();
    } catch (err) {
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
