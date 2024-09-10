import { Request } from 'express';

export class RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}
