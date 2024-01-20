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
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.getResponse();
    const previewMessage = exception.message;
    const { path, method } = request;
    this.logger.error(
      JSON.stringify({
        path,
        method,
        status,
        previewMessage,
        timestamp: new Date().toISOString(),
      }),
    );
    response.status(status).json({
      path,
      method,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
