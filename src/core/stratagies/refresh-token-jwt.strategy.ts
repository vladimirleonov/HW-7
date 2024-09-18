// import { Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from '../../features/auth/auth/application/auth.service';
// import { Result, ResultStatus } from '../../base/types/object-result';
// import { unixToISOString } from '../utils/convert-unix-to-iso';
// import { ConfigService } from '@nestjs/config';
// import { ConfigurationType } from '../../settings/env/configuration';
// import { RequestWithDeviceAndCookies } from '../../base/types/request-with-device-and-cookie';
//
// @Injectable()
// export class RefreshTokenJwtStrategy extends PassportStrategy(
//   Strategy,
//   'refresh-token',
// ) {
//   constructor(
//     private authService: AuthService,
//     private readonly configService: ConfigService<ConfigurationType, true>,
//   ) {
//     super({
//       jwtFromRequest: (req: RequestWithDeviceAndCookies) => {
//         return req.cookies?.refreshToken || null;
//       },
//       ignoreExpiration: false,
//       secretOrKey: configService.get('apiSettings', {
//         infer: true,
//       }).JWT_SECRET,
//       passReqToCallback: true,
//     });
//   }
//
//   async validate(req: RequestWithDeviceAndCookies, payload: any) {
//     const { userId, deviceId, iat } = payload;
//
//     const validateUserByIdResult: Result =
//       await this.authService.validateUserById(userId);
//
//     if (validateUserByIdResult.status === ResultStatus.NotFound) {
//       throw new UnauthorizedException();
//     }
//
//     req.device = {
//       userId,
//       deviceId,
//       iat: unixToISOString(iat),
//     };
//
//     // TODO: think about how not to pass default req.user
//     return {};
//   }
// }
