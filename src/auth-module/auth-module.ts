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

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [PrismaProvider, PasswordService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RegisterValidationMiddleware,
        RegisterSanitationMiddleware,
        VerifyUserUnique,
        HashPasswordMiddleware,
      )
      .forRoutes('/api/auth/register');
  }
}
