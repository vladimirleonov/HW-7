export enum ResultStatus {
  Success = 'Success',
  NotFound = 'Not Found',
  Forbidden = 'Forbidden',
  Unauthorized = 'Unauthorized',
  BadRequest = 'Bad Request',
  TooManyRequests = 'Too Many Requests',
  InternalError = 'Internal Error',
}

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
    errorMessage?: string,
    extensions?: Array<{ field: string; message: string }>,
  ): Result<T> {
    return new Result(
      ResultStatus.BadRequest,
      null as any,
      errorMessage,
      extensions,
    );
  }

  static notFound<T = null>(
    errorMessage?: string,
    extensions?: Array<{ field: string; message: string }>,
  ): Result<T> {
    return new Result(
      ResultStatus.NotFound,
      null as any,
      errorMessage,
      extensions,
    );
  }

  static unauthorized<T = null>(
    errorMessage?: string,
    extensions?: Array<{ field: string; message: string }>,
  ): Result<T> {
    return new Result(
      ResultStatus.Unauthorized,
      null as any,
      errorMessage,
      extensions,
    );
  }

  static forbidden<T = null>(
    errorMessage?: string,
    extensions?: Array<{ field: string; message: string }>,
  ): Result<T> {
    return new Result(
      ResultStatus.Forbidden,
      null as any,
      errorMessage,
      extensions,
    );
  }

  static tooManyRequests<T = null>(
    errorMessage?: string,
    extensions?: Array<{ field: string; message: string }>,
  ): Result<T> {
    return new Result(
      ResultStatus.TooManyRequests,
      null as any,
      errorMessage,
      extensions,
    );
  }

  static internalError<T = null>(
    errorMessage?: string,
    extensions?: Array<{ field: string; message: string }>,
  ): Result<T> {
    return new Result(
      ResultStatus.InternalError,
      null as any,
      errorMessage,
      extensions,
    );
  }
}
