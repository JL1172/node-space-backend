import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth-controller';
import {
  HashPasswordMiddleware,
  RegisterSanitationMiddleware,
  RegisterValidationMiddleware,
  VerifyUserUnique,
} from './services/middleware/register-mw';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import { PasswordService } from './services/providers/register-service';
import {
  LoginBodySanitationMiddleware,
  LoginBodyValidationMiddleware,
  VerifyPasswordCorrectMiddleware,
  VerifyUserExitsMiddleware,
} from './services/middleware/login-mw';
import {
  PasswordComparison,
  UserJwtStorage,
} from './services/providers/login-service';
import { JwtProvider } from 'src/global-utils/global-services/providers/JwtProvider';
import {
  BlacklistJwtMiddleware,
  LogoutSanitationMiddleware,
  LogoutValidationMiddleware,
  VerifyJwtUnique,
  VerifyJwtValidMiddleware,
} from './services/middleware/logout-mw';
import { JwtStorage } from './services/providers/logout-service';
import { RateLimitMiddleware } from 'src/global-utils/global-middleware/RateLimiterMiddleware';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    PrismaProvider,
    PasswordService,
    PasswordComparison,
    UserJwtStorage,
    JwtProvider,
    JwtStorage,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('/api/auth/register', '/api/auth/login', '/api/auth/logout');
    consumer
      .apply(
        RegisterValidationMiddleware,
        RegisterSanitationMiddleware,
        VerifyUserUnique,
        HashPasswordMiddleware,
      )
      .forRoutes('/api/auth/register');
    consumer
      .apply(
        LoginBodyValidationMiddleware,
        LoginBodySanitationMiddleware,
        VerifyUserExitsMiddleware,
        VerifyPasswordCorrectMiddleware,
      )
      .forRoutes('/api/auth/login');
    consumer
      .apply(
        LogoutValidationMiddleware,
        LogoutSanitationMiddleware,
        VerifyJwtUnique,
        VerifyJwtValidMiddleware,
        BlacklistJwtMiddleware,
      )
      .forRoutes('/api/auth/logout');
  }
}
