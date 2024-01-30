import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth-controller';
import {
  HashPasswordMiddleware,
  RegisterRateLimiter,
  RegisterSanitationMiddleware,
  RegisterValidationMiddleware,
  VerifyUserUnique,
} from './services/middleware/register-mw';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import { PasswordService } from './services/providers/register-service';
import {
  IpVerificationMiddleware,
  LoginBodySanitationMiddleware,
  LoginBodyValidationMiddleware,
  LoginRateLimiter,
  VerifyPasswordCorrectMiddleware,
  VerifyUserExitsMiddleware,
} from './services/middleware/login-mw';
import {
  IpAddressLookupProvider,
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
import { ApiKeyVerification } from 'src/global-utils/global-middleware/ApiKeyMiddleware';
import {
  RestrictedRouteRateLimitMiddleware,
  RestrictedRouteSanitation,
  RestrictedRouteValidation,
  VerifyJwtValidationMiddleware,
} from './services/middleware/restricted-route-mw';
import {
  RestrictedJwtService,
  RestrictedPayloadService,
} from './services/providers/restricted-route-service';
import { DecodedTokenStorageService } from 'src/global-utils/global-services/providers/DecodedTokenStorage';

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
    RestrictedJwtService,
    RestrictedPayloadService,
    DecodedTokenStorageService,
    IpAddressLookupProvider,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyVerification)
      .forRoutes(
        '/api/auth/register',
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/restricted-check',
      );
    consumer
      .apply(
        RegisterRateLimiter,
        RegisterValidationMiddleware,
        RegisterSanitationMiddleware,
        VerifyUserUnique,
        HashPasswordMiddleware,
      )
      .forRoutes('/api/auth/register');
    consumer
      .apply(
        LoginRateLimiter,
        IpVerificationMiddleware,
        // LoginBodyValidationMiddleware,
        // LoginBodySanitationMiddleware,
        // VerifyUserExitsMiddleware,
        // VerifyPasswordCorrectMiddleware,
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
    consumer
      .apply(
        RestrictedRouteRateLimitMiddleware,
        RestrictedRouteValidation,
        RestrictedRouteSanitation,
        VerifyJwtValidationMiddleware,
      )
      .forRoutes('/api/auth/restricted-check');
  }
}
