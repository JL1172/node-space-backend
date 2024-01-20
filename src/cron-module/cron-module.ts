import { Module } from '@nestjs/common';
import { CronJobOne } from './cron-job';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';

@Module({
  providers: [CronJobOne, PrismaProvider],
})
export class CronModule {}
