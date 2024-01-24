import { AuthorizationModule } from './authorization-module/authorization.module';
import { AuthorizationController } from './authorization-module/authorization.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaProvider } from './global-utils/global-services/providers/PrismaProvider';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './authentication-module/authentication-module';
import { CronModule } from './cron-module/cron-module';
import { ActivityLogger } from './global-utils/global-middleware/LoggerMiddleware';
import { JwtProvider } from './global-utils/global-services/providers/JwtProvider';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    AuthorizationModule,
    CronModule,
  ],
  controllers: [AuthorizationController, AppController],
  providers: [PrismaProvider, JwtProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ActivityLogger).forRoutes('*');
  }
}
