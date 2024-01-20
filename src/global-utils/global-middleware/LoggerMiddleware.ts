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
    this.logger.log(
      `(Method: ${req.method}) (Path: ${
        req.baseUrl
      }) (Timestamp: ${new Date().toISOString()}) (IP: ${
        process.env.STATUS && process.env.STATUS === 'dev'
          ? os.networkInterfaces().wlp48s0[0]?.address
          : 'N/A'
      })`,
    );
    next();
  }
}
