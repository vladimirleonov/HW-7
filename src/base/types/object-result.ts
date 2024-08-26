export enum ResultStatus {
  Success = 'Success',
  NotFound = 'Not Found',
  Forbidden = 'Forbidden',
  Unauthorized = 'Unauthorized',
  BadRequest = 'Bad Request',
  TooManyRequests = 'Too Many Requests',
  InternalError = 'Internal Error',
}

// export type Result<T = null> = {
//   status: ResultStatus;
//   errorMessage?: string;
//   extensions?: [{ field: string; message: string }];
//   data: T;
// };

export class Result<T = null> {
  status: ResultStatus;
  data: T;
  errorMessage?: string;
  extensions?: Array<{ field: string; message: string }>;

  constructor(
    status: ResultStatus,
    data: T,
    errorMessage?: string,
    extensions?: Array<{ field: string; message: string }>,
  ) {
    this.status = status;
    this.data = data;
    this.errorMessage = errorMessage;
    this.extensions = extensions;
  }
  static success<T = null>(data: T | null = null): Result<T | null> {
    return new Result(ResultStatus.Success, data);
  }
  static badRequest<T = null>(
    extensions?: Array<{ field: string; message: string }>,
    errorMessage?: string,
  ): Result<T> {
    return new Result(
      ResultStatus.BadRequest,
      null as any,
      errorMessage,
      extensions,
    );
  }
  static notFound<T = null>(
    extensions?: Array<{ field: string; message: string }>,
    errorMessage?: string,
  ): Result<T> {
    return new Result(
      ResultStatus.NotFound,
      null as any,
      errorMessage,
      extensions,
    );
  }
  static unauthorized<T = null>(
    extensions?: Array<{ field: string; message: string }>,
    errorMessage?: string,
  ): Result<T> {
    return new Result(
      ResultStatus.Unauthorized,
      null as any,
      errorMessage,
      extensions,
    );
  }
}
