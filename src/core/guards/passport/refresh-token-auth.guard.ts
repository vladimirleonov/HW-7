import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenAuthGuard extends AuthGuard('refresh-token') {
  canActivate(context: ExecutionContext) {
    console.log('Activating refresh token guard');
    return super.canActivate(context);
  }
}
