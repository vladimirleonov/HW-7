import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../features/auth/application/auth.service';
import { Result, ResultStatus } from '../../base/types/object-result';
import { JwtPayload } from 'jsonwebtoken';
import { unixToISOString } from '../utils/convert-unix-to-iso';

export interface RequestWithDeviceAndCookies extends Request {
  cookies: { [key: string]: string };
  device: {
    userId: string;
    deviceId: string;
    iat: string;
  };
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: RequestWithDeviceAndCookies) {
    const refreshToken: string = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const validateRefreshTokenResult: Result<JwtPayload | null> =
      await this.authService.validateRefreshToken(refreshToken);

    if (validateRefreshTokenResult.status === ResultStatus.Unauthorized) {
      throw new UnauthorizedException();
    }

    const { userId, deviceId, iat } =
      validateRefreshTokenResult.data as JwtPayload;

    const validateUserByIdResult: Result =
      await this.authService.validateUserById(userId);

    if (validateUserByIdResult.status === ResultStatus.NotFound) {
      throw new UnauthorizedException();
    }

    req.device = {
      userId,
      deviceId,
      iat: unixToISOString(iat),
    };

    return { userId, deviceId, iat };
  }
}
