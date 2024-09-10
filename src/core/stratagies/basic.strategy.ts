import { BasicStrategy as Strategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../exception-filters/http-exception-filter';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../settings/env/configuration';
import { ApiSettings } from '../../settings/env/api-settings';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    super({
      passReqToCallback: true,
    });
  }

  async validate(req, username, password): Promise<any> {
    const apiSettings: ApiSettings = this.configService.get('apiSettings', {
      infer: true,
    });

    if (
      apiSettings.ADMIN_LOGIN === username &&
      apiSettings.ADMIN_PASSWORD === password
    ) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
