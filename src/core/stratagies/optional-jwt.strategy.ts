import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../settings/env/configuration';
import { Request } from 'express';

// logic optional-jwt
// -- with token
// 1) token valid, not expired -> validate
// 2) token token not valid -> 401 unauthorized
// 3) request passed in OptionalJwtAuthGuard.handleRequest() -> return user
// -- without token -> null or undefined
// 1) no token -> pass validation
// 2) request passed in OptionalJwtAuthGuard.handleRequest() -> user = null -> return { userId: null }

@Injectable()
export class OptionalJwtStrategy extends PassportStrategy(
  Strategy,
  'optional-jwt',
) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 401 Unauthorized
      secretOrKey: configService.get('apiSettings', {
        infer: true,
      }).JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    if (!payload) {
      return { userId: null };
    }

    return { userId: payload.userId || null };
  }
}
