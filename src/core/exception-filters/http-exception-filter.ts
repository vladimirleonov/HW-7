import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../settings/env/configuration';
import { EnvironmentSettings } from '../../settings/env/env-settings';

export class CustomError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string = 'An error occurred',
    public readonly errorMessages?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends CustomError {
  constructor(errorMessages: Array<{ field: string; message: string }>) {
    super(400, 'Bad Request', errorMessages);
  }
}

export class NotFoundException extends CustomError {
  constructor(message: string = 'Not Found') {
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

// my
// check if this error is an instance of class CustomError
@Catch(CustomError)
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {}
  catch(exception: CustomError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status: number = exception.statusCode;

    const environmentSettings: EnvironmentSettings = this.configService.get(
      'environmentSettings',
      { infer: true },
    );

    console.log('exception filter custom error');

    if (status === HttpStatus.BAD_REQUEST) {
      const errorsResponse = {
        errorsMessages: exception.errorMessages || [
          { message: 'Unknown error', field: 'unknown' },
        ],
      };

      response.status(status).json(errorsResponse);
      return;
    }

    if (!environmentSettings.isProduction) {
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

// libs
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.log('HttpException error');

    const errorsResponse: any = {};

    if (status === HttpStatus.BAD_REQUEST) {
      const responseBody: any = exception.getResponse();
      console.log('responseBody.message', responseBody.message);
      errorsResponse.errorsMessages = Array.isArray(responseBody.message)
        ? responseBody.message
        : [responseBody.message];

      response.status(status).json(errorsResponse);
      return;
    }

    errorsResponse.statusCode = status;
    errorsResponse.message = exception.message;
    errorsResponse.timestamp = new Date().toISOString();
    errorsResponse.path = request.url;

    response.status(status).json(errorsResponse);
  }
}

// General Error Filter
// @Catch()
// export class ErrorExceptionFilter implements ExceptionFilter {
//   constructor(
//     private readonly configService: ConfigService<ConfigurationType, true>,
//   ) {}
//
//   catch(exception: Error, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//
//     const environmentSettings: EnvironmentSettings = this.configService.get(
//       'environmentSettings',
//       { infer: true },
//     );
//
//     const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
//     const message = 'Some unexpected error occurred';
//
//     if (!environmentSettings.isProduction) {
//       response.status(statusCode).json({
//         statusCode,
//         message,
//         timestamp: new Date().toISOString(),
//         path: request.url,
//         stack: exception.stack,
//       });
//     } else {
//       response.status(statusCode).json({
//         statusCode,
//         message,
//         timestamp: new Date().toISOString(),
//         path: request.url,
//       });
//     }
//   }
// }

// @Catch(CustomError)
// export class CustomExceptionFilter implements ExceptionFilter {}

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
