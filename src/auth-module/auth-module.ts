import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth-controller';
import {
  RegisterSanitationMiddleware,
  RegisterValidationMiddleware,
} from './services/middleware/register-mw';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [PrismaProvider],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RegisterValidationMiddleware, RegisterSanitationMiddleware)
      .forRoutes('/api/auth/register');
  }
}
