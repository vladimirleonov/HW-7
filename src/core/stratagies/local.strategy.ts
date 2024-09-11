import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../features/auth/auth/application/auth.service';
import { UnauthorizedException } from '../exception-filters/http-exception-filter';
import { Result } from '../../base/types/object-result';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    // console.log(loginOrEmail);
    // console.log(password);
    const result: Result<string> =
      await this.authService.validateUserByLoginOrEmailAndPassword(
        loginOrEmail,
        password,
      );

    const userId: string = result.data;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return { id: userId };
  }
}
