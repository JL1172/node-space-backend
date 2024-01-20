import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { RateLimitMiddleware } from './global-utils/global-middleware/RateLimiterMiddleware';
import { ActivityLogger } from './global-utils/global-middleware/LoggerMiddleware';
import { PrismaProvider } from './global-utils/global-services/providers/PrismaProvider';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth-module/auth-module';
import * as cors from 'cors';
import * as hpp from 'hpp';
import { CronModule } from './cron-module/cron-module';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule, CronModule],
  controllers: [AppController],
  providers: [PrismaProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ActivityLogger, RateLimitMiddleware, cors(), hpp())
      .forRoutes('*');
  }
}
