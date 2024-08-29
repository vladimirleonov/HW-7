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
// @Catch(Error)
// export class ErrorExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//
//     if (!appSettings.env.isProduction()) {
//       response
//         .status(500)
//         .send({ error: exception.toString(), stack: exception.stack });
//     } else {
//       response.status(500).send('some error occurred');
//     }
//   }
// }
//
// check if this error is an instance of class HttpException
// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const status = exception.getStatus();
//
//     // 404
//     if (exception.getStatus() === HttpStatus.BAD_REQUEST) {
//       const errorsResponse = {
//         errorsMessages: [],
//       };
//
//       const responseBody: any = exception.getResponse();
//       console.log(responseBody, 'responseBody');
//       if (Array.isArray(responseBody.message)) {
//         console.log('Array');
//         responseBody.message.forEach((e) => {
//           console.log(e);
//           // @ts-ignore
//           errorsResponse.errorsMessages.push(e);
//         });
//       } else {
//         console.log('plain');
//         console.log(responseBody.message);
//         // @ts-ignore
//         errorsResponse.errorsMessages.push(responseBody.message);
//       }
//
//       response.status(status).send(errorsResponse);
//       return;
//     }
//
//     // 401
//     if (exception.getStatus() === HttpStatus.UNAUTHORIZED) {
//       response.status(HttpStatus.UNAUTHORIZED).send();
//       return;
//     }
//
//     // 429
//     if (exception.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
//       response.status(HttpStatus.TOO_MANY_REQUESTS).send();
//       return;
//     }
//
//     response.status(status).json({
//       statusCode: status,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//     });
//   }
// }

export class CustomError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends CustomError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundException extends CustomError {
  constructor(message: string) {
    console.log(message);
    super(404, message);
  }
}

export class UnauthorizedException extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export class TooManyRequestsException extends CustomError {
  constructor(message: string) {
    super(429, message);
  }
}

export class InternalServerErrorException extends CustomError {
  constructor(message: string = 'Something went wrong') {
    super(500, message);
  }
}

// check if this error is an instance of class CustomError
@Catch(CustomError)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (!appSettings.env.isProduction()) {
      response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });

      // response
      //   .status(500)
      //   .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send('some error occurred');
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.log(exception);

    const errorsResponse: any = {
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status === HttpStatus.BAD_REQUEST) {
      const responseBody: any = exception.getResponse();
      errorsResponse.errorsMessages = Array.isArray(responseBody.message)
        ? responseBody.message
        : [responseBody.message];
    }

    response.status(status).json(errorsResponse);
  }
}

// // check if this error is an instance of class HttpException
// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const status = exception.getStatus();
//
//     // 404
//     if (exception.getStatus() === HttpStatus.BAD_REQUEST) {
//       const errorsResponse = {
//         errorsMessages: [],
//       };
//
//       const responseBody: any = exception.getResponse();
//       console.log(responseBody, 'responseBody');
//       if (Array.isArray(responseBody.message)) {
//         console.log('Array');
//         responseBody.message.forEach((e) => {
//           console.log(e);
//           // @ts-ignore
//           errorsResponse.errorsMessages.push(e);
//         });
//       } else {
//         console.log('plain');
//         console.log(responseBody.message);
//         // @ts-ignore
//         errorsResponse.errorsMessages.push(responseBody.message);
//       }
//
//       response.status(status).send(errorsResponse);
//       return;
//     }
//
//     response.status(status).json({
//       statusCode: status,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//     });
//   }
// }
