import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../features/auth/application/auth.service';
import { Result, ResultStatus } from '../../base/types/object-result';
import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import { unixToISOString } from '../../base/utils/convert-unix-to-iso';

export interface RequestWithDeviceAndCookies extends Request {
  cookies: { [key: string]: string };
  device: {
    userId: string;
    deviceId: string;
    //?
    iat: string;
  };
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithDeviceAndCookies = context
      .switchToHttp()
      .getRequest();

    const refreshToken: string = request.cookies?.refreshToken;
    console.log('refreshToken', refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const result: Result<JwtPayload | null> =
      await this.authService.checkRefreshToken(refreshToken);
    console.log('result', result);
    if (result.status === ResultStatus.Unauthorized) {
      throw new UnauthorizedException();
    }

    const { userId, deviceId, iat } = result.data as JwtPayload;
    request.device = {
      userId,
      deviceId,
      //?
      iat: unixToISOString(iat),
    };
    return true;
  }
}
