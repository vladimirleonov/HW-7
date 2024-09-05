import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('optional-jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      return { userId: null };
    }
    return user;
  }
}
