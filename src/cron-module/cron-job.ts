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

@Injectable()
export class CronJobTwo {
  private readonly logger = new Logger(CronJobTwo.name);
  constructor(private readonly prisma: PrismaProvider) {
    this.logger = new Logger(CronJobTwo.name);
  }
  @Cron(CronExpression.EVERY_HOUR)
  async queryIpAddresses(): Promise<void> {
    try {
      await this.prisma.clearIpEntries();
      this.logger.log(
        `[Background Worker] Cron Job Two Executed Successfully [IP Addresses On Watchlist Exceeding 24 Hours Deleted]`,
      );
    } catch (err) {
      this.logger.error(`Error Executing Cron Job: ${err}`);
    }
  }
}
@Injectable()
export class CronJobThree {
  private readonly logger = new Logger(CronJobThree.name);
  constructor(private readonly prisma: PrismaProvider) {
    this.logger = new Logger(CronJobTwo.name);
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async queryIpAddresses(): Promise<void> {
    try {
      await this.prisma.clearBlackListEntries();
      this.logger.log(
        `[Background Worker] Cron Job Three Executed Successfully [IP Addresses On Blacklist Exceeding 1 Week Deleted]`,
      );
    } catch (err) {
      this.logger.error(`Error Executing Cron Job: ${err}`);
    }
  }
}
