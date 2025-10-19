import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { timeDiffMinutesDetails } from '../utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request: Request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = new Date();

    return next.handle().pipe(
      tap(() => {
        const response: Response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const contentLength = response.get('content-length');

        const timeDiff = timeDiffMinutesDetails(now, new Date());
        console.log(`${method} ${url} ${statusCode} ${contentLength || 0} - ${timeDiff}`);
      }),
    );
  }
}
