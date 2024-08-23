export enum ResultStatus {
  Success = 'Success',
  NotFound = 'Not Found',
  Forbidden = 'Forbidden',
  Unauthorized = 'Unauthorized',
  BadRequest = 'Bad Request',
  TooManyRequests = 'Too Many Requests',
  InternalError = 'Internal Error',
}

// export class Result<T = null> {
//   status: ResultStatus;
//   errorMessage: string | null;
//   extensions: Array<{ field: string; message: string }>;
//   data: T;
//
//   constructor(
//     status: ResultStatus,
//     data: T = null,
//     errorMessage?: string,
//     extensions?: Array<{ field: string; message: string }>,
//   ) {
//
//   }
// }

export type Result<T = null> = {
  status: ResultStatus;
  errorMessage?: string;
  extensions?: [{ field: string; message: string }];
  data: T;
};
