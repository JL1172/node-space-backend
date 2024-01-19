import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as os from 'node:os';

@Injectable()
export class ActivityLogger implements NestMiddleware {
  private readonly logger = new Logger(ActivityLogger.name);
  constructor() {
    this.logger = new Logger(ActivityLogger.name);
  }
  use(req: Request, res: Response, next: NextFunction) {
    const path: string = req.path;
    const ipAddress: string =
      process.env.STATUS === 'dev'
        ? os.networkInterfaces().wlp48s0[0]?.address
        : 'N/A';
    const timeStamp: string = new Date().toISOString();
    const method: string = req.method;
    this.logger.log(
      `[Method: ${method}] [Path: ${path}] [ip: ${ipAddress}] [Time Stamp: ${timeStamp}]`,
    );
    next();
  }
}
