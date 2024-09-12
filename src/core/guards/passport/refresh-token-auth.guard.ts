import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenAuthGuard extends AuthGuard('refresh-token') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
