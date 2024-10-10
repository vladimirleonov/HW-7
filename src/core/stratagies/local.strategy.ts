import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../features/auth/auth/application/auth.service';
import { UnauthorizedException } from '../exception-filters/http-exception-filter';
import { Result } from '../../base/types/object-result';

// check authentication (extracts data from body)
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const result: Result<number> =
      await this.authService.validateUserByLoginOrEmailAndPassword(
        loginOrEmail,
        password,
      );

    const userId: number = result.data;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return { id: userId };
  }
}
