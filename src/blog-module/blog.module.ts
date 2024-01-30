import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';
import { BlogController } from './blog.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RateLimitMiddleware } from 'src/global-utils/global-middleware/RateLimiterMiddleware';
import { ApiKeyVerification } from 'src/global-utils/global-middleware/ApiKeyMiddleware';
import {
  RestrictedRouteSanitation,
  RestrictedRouteValidation,
  VerifyJwtValidationMiddleware,
} from 'src/auth-module/services/middleware/restricted-route-mw';
import {
  RestrictedJwtService,
  RestrictedPayloadService,
} from 'src/auth-module/services/providers/restricted-route-service';
import { JwtProvider } from 'src/global-utils/global-services/providers/JwtProvider';
import { DecodedTokenStorageService } from 'src/global-utils/global-services/providers/DecodedTokenStorage';

@Module({
  imports: [],
  controllers: [BlogController],
  providers: [
    PrismaProvider,
    RestrictedJwtService,
    RestrictedPayloadService,
    JwtProvider,
    DecodedTokenStorageService,
  ],
})
export class BlogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        ApiKeyVerification,
        RateLimitMiddleware,
        RestrictedRouteValidation,
        RestrictedRouteSanitation,
        VerifyJwtValidationMiddleware,
      )
      .forRoutes('/api/categories');
  }
}