import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  constructor() {
    this.logger = new Logger(HttpExceptionFilter.name);
  }
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.status;
    const message = exception.getResponse();
    const previewMessage = exception.message;
    const { path, method } = request;
    const timestamp = new Date();
    this.logger.error(
      JSON.stringify({ path, method, status, previewMessage, timestamp }),
    );
    response.status(status).json({ path, method, status, message, timestamp });
  }
}
