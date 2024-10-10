/*
import { Injectable, NestInterceptor } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import { Observable } from 'rxjs';
import { CallHandler } from '@nestjs/common/interfaces/features/nest-interceptor.interface';

@Injectable()
export class ClearCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responce = context.switchToHttp().getResponse();

    responce.clearCookie('refreshToken', {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      sameSite: 'strict', // protects against CSRF attacks
    });

    return next.handle();
  }
}
*/
