import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiKeyVerification } from 'src/global-utils/global-middleware/ApiKeyMiddleware';
import { RateLimitMiddleware } from 'src/global-utils/global-middleware/RateLimiterMiddleware';
import { AuthorizationController } from './authorization.controller';
import { JwtProvider } from 'src/global-utils/global-services/providers/JwtProvider';
import { RestrictedRouteValidation } from './services/middleware/restricted-route-middleware';

@Module({
  imports: [],
  controllers: [AuthorizationController],
  providers: [JwtProvider],
})
export class AuthorizationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyVerification, RateLimitMiddleware)
      .forRoutes('api/verification/restricted-check');
    consumer
      .apply(RestrictedRouteValidation)
      .forRoutes('api/verification/restricted-check');
  }
}
