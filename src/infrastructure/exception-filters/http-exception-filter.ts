import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { appSettings } from '../../settings/app-settings';

// check if this error is an instance of class Error
@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (!appSettings.env.isProduction()) {
      response
        .status(500)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send('some error occurred');
    }
  }
}

// check if this error is an instance of class HttpException
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // 404
    if (exception.getStatus() === HttpStatus.BAD_REQUEST) {
      const errorsResponse = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();
      console.log(responseBody, 'responseBody');
      if (Array.isArray(responseBody.message)) {
        console.log('Array');
        responseBody.message.forEach((e) => {
          console.log(e);
          // @ts-ignore
          errorsResponse.errorsMessages.push(e);
        });
      } else {
        console.log('plain');
        console.log(responseBody.message);
        // @ts-ignore
        errorsResponse.errorsMessages.push(responseBody.message);
      }

      response.status(status).send(errorsResponse);
      return;
    }

    // 401
    if (exception.getStatus() === HttpStatus.UNAUTHORIZED) {
      response.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    // 429
    if (exception.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
      response.status(HttpStatus.TOO_MANY_REQUESTS).send();
      return;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

// export class CustomError extends Error {
//   constructor(
//     private statusCode: number,
//     private message: string,
//   ) {
//     super(message);
//   }
// }
//
// export class NotFoundDomainException extends CustomError {
//   constructor(public message: string) {
//     super(400, message);
//   }
// }
