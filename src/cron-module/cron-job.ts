import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaProvider } from 'src/global-utils/global-services/providers/PrismaProvider';

@Injectable()
export class CronJobOne {
  private readonly logger = new Logger(CronJobOne.name);
  constructor(private readonly prisma: PrismaProvider) {
    this.logger = new Logger(CronJobOne.name);
  }
  @Cron(CronExpression.EVERY_HOUR)
  async queryJwtExpired(): Promise<void> {
    try {
      const before_count: number = await this.prisma.cronJobJwtFnOne();
      const after_count: number = await this.prisma.cronJobJwtFnTwo();
      this.logger.log(
        `[Background Worker] Cron Job One Executed Successfully [${
          before_count - after_count
        } Expired Tokens Successfully Deleted] [${after_count} Tokens Remaining]`,
      );
    } catch (err) {
      this.logger.error(`Error Executing Cron Job: ${err}`);
    }
  }
}
