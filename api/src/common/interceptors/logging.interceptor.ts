import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: unknown): void => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `${method} ${url} ${response.statusCode} - ${responseTime}ms`,
          );
        },
        error: (error: Error): void => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `${method} ${url} ${response.statusCode} - ${responseTime}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
