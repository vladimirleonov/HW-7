export enum ResultStatus {
  Success = 'Success',
  NotFound = 'Not Found',
  Forbidden = 'Forbidden',
  Unauthorized = 'Unauthorized',
  BadRequest = 'Bad Request',
  TooManyRequests = 'Too Many Requests',
  InternalError = 'Internal Error',
}

export type Result<T = null> = {
  status: ResultStatus;
  errorMessage?: string;
  extensions?: [{ field: string; message: string }];
  data: T;
};
