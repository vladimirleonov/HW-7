import { Request } from 'express';

export interface RequestWithOptionalUserId extends Request {
  user: { userId: string };
}
