import { Module } from '@nestjs/common';
import { CronJobOne, CronJobThree, CronJobTwo } from './cron-job';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';

@Module({
  providers: [CronJobOne, CronJobTwo, CronJobThree, PrismaProvider],
})
export class CronModule {}
