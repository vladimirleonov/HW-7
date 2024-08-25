import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Result, ResultStatus } from '../../base/types/object-result';
import { AuthService } from '../../features/auth/application/auth.service';

interface ExtendedJwtPayload extends JwtPayload {
  userId: string;
}

export interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    const authHeader: string | undefined = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const result: Result<JwtPayload | null> =
      await this.authService.checkAccessToken(authHeader);
    if (result.status === ResultStatus.Success) {
      // TODO: think about ExtendedJwtPayload
      request.user = result.data as ExtendedJwtPayload;
      return true;
    }

    throw new UnauthorizedException();
  }
}
