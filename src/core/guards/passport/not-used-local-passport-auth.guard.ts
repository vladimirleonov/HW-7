import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '../../exception-filters/http-exception-filter';

// redo default user return from local strategy
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    if (err || !user) {
      throw new UnauthorizedException();
    }

    delete req.user;

    req.userId = user;

    return user; // return user to adhere to the standard behavior Guard
  }
}
