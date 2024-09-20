import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Result, ResultStatus } from '../../base/types/object-result';
import { UnauthorizedException } from '../exception-filters/http-exception-filter';
import { AuthService } from '../../features/auth/auth/application/auth.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../settings/env/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('apiSettings', {
        infer: true,
      }).JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const { userId } = payload;

    const result: Result = await this.authService.validateUserById(userId);

    if (result.status === ResultStatus.NotFound) {
      throw new UnauthorizedException();
    }

    return { id: payload.userId };
  }
}
