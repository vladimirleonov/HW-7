import { Request } from 'express';

export class RequestWithOptionalUserId extends Request {
  user: { userId: string };
}
