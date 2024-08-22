import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.log(exception.getResponse());
    if (exception.getStatus() === HttpStatus.BAD_REQUEST) {
      const errorsResponse = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();

      if (Array.isArray(responseBody.message)) {
        console.log('Array');
        responseBody.message.forEach((e) => {
          console.log(e);
          // @ts-ignore
          errorsResponse.errorsMessages.push(e);
        });
      } else {
        console.log('plain');
        // @ts-ignore
        errorsResponse.errorsMessages.push(responseBody.message);
      }

      response.status(status).send(errorsResponse);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
