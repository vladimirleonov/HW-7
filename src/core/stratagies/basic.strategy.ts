import { BasicStrategy as Strategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AppSettings } from '../../settings/app-settings';
import { UnauthorizedException } from '../exception-filters/http-exception-filter';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly appSettings: AppSettings) {
    super({
      passReqToCallback: true,
    });
  }

  async validate(req, username, password): Promise<any> {
    if (
      this.appSettings.api.ADMIN_LOGIN === username &&
      this.appSettings.api.ADMIN_PASSWORD === password
    ) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
