import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaProvider } from './global-utils/global-services/providers/PrismaProvider';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth-module/auth-module';
import { CronModule } from './cron-module/cron-module';
import { ActivityLogger } from './global-utils/global-middleware/LoggerMiddleware';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule, CronModule],
  controllers: [AppController],
  providers: [PrismaProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ActivityLogger).forRoutes('*');
  }
}
