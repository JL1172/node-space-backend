import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { RateLimitMiddleware } from './global-utils/global-middleware/RateLimiterMiddleware';
import { ActivityLogger } from './global-utils/global-middleware/LoggerMiddleware';
import { PrismaProvider } from './global-utils/global-services/providers/PrismaProvider';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobOne } from './global-utils/global-services/cron/cron-job-one-jwt';
import { AuthModule } from './auth-module/auth-module';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule],
  controllers: [AppController],
  providers: [PrismaProvider, CronJobOne],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware, ActivityLogger).forRoutes('*');
  }
}
