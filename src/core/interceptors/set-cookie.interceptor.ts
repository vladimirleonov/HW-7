/*
import { NestInterceptor } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import { Observable, tap } from 'rxjs';
import { CallHandler } from '@nestjs/common/interfaces/features/nest-interceptor.interface';
import { Response } from 'express';

export class SetCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response: Response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap((result) => {
        console.log(result?.refreshToken);
        if (result?.refreshToken) {
          response.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true, // или настраиваемое значение, например `SETTINGS.NODE_ENV === 'production'`
            sameSite: 'strict',
          });
        }
      }),
    );
  }
}
*/
