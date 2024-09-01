// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { AuthService } from '../../features/auth/application/auth.service';
// import { Result, ResultStatus } from '../../base/types/object-result';
// import { JwtPayload } from 'jsonwebtoken';
// import { Request } from 'express';
// import { unixToISOString } from '../utils/convert-unix-to-iso';
//
// export interface RequestWithDeviceAndCookies extends Request {
//   cookies: { [key: string]: string };
//   device: {
//     userId: string;
//     deviceId: string;
//     iat: string;
//   };
// }
//
// @Injectable()
// export class RefreshTokenGuard implements CanActivate {
//   constructor(private readonly authService: AuthService) {}
//
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request: RequestWithDeviceAndCookies = context
//       .switchToHttp()
//       .getRequest();
//
//     const refreshToken: string = request.cookies?.refreshToken;
//
//     if (!refreshToken) {
//       throw new UnauthorizedException();
//     }
//
//     const result: Result<JwtPayload | null> =
//       await this.authService.checkRefreshToken(refreshToken);
//
//     if (result.status === ResultStatus.Unauthorized) {
//       throw new UnauthorizedException();
//     }
//
//     const { userId, deviceId, iat } = result.data as JwtPayload;
//
//     request.device = {
//       userId,
//       deviceId,
//       iat: unixToISOString(iat),
//     };
//
//     return true;
//   }
// }
