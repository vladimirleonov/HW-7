import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AppSettings } from '../../../settings/app-settings';
import { randomUUID } from 'node:crypto';
import { JwtService } from '../../../../base/application/jwt.service';
import { ResultStatus } from '../../../../base/types/object-result';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CryptoService } from '../../../../base/application/crypto.service';
import { UserDocument } from '../../users/domain/user.entity';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly appSettings: AppSettings,
    private readonly jwtService: JwtService,
    private readonly userRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}
  async generatePasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, this.appSettings.api.HASH_ROUNDS);
  }
  async login(dto) {
    if (dto.refreshToken) {
      try {
        this.jwtService.verifyToken(dto.refreshToken);
        return {
          status: ResultStatus.BadRequest,
          extensions: [
            {
              field: 'refreshToken',
              message:
                'Refresh token is still valid. Logout before logging in again',
            },
          ],
          data: null,
        };
      } catch (err) {
        // console.log('Invalid refresh token, proceeding with login')
      }
    }

    const user: UserDocument | null =
      await this.userRepository.findUserByLoginOrEmailField(dto.loginOrEmail);
    if (
      !user ||
      !(await this.cryptoService.compare(dto.password, user.password))
    ) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [
          { field: 'login or password', message: 'Wrong login or password' },
        ],
        data: null,
      };
    }

    if (!user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{ field: 'email', message: 'Email is not confirmed' }],
        data: null,
      };
    }

    const JwtAccessTokenPayload: JwtPayload = {
      userId: user._id.toString(),
    };

    const deviceId: string = randomUUID();

    const JwtRefreshTokenPayload: JwtPayload = {
      userId: user._id.toString(),
      deviceId: deviceId,
    };

    const accessToken: string = this.jwtService.generateToken(
      JwtAccessTokenPayload,
      '10h',
    );
    const refreshToken: string = this.jwtService.generateToken(
      JwtRefreshTokenPayload,
      '20h',
    );

    const decodedRefreshToken: string | JwtPayload | null =
      this.jwtService.decode(refreshToken);
    if (decodedRefreshToken && typeof decodedRefreshToken !== 'string') {
      const { iat, exp } = decodedRefreshToken;

      const deviceName: string = dto.deviceName;
      const ip: string = dto.ip;

      // const UserDeviceData: Device = new Device(
      //   new ObjectId(),
      //   user._id.toString(),
      //   decodedRefreshToken.deviceId,
      //   unixToISOString(iat),
      //   deviceName,
      //   ip,
      //   unixToISOString(exp),
      // );

      // const UserDeviceDocument: DeviceDocument = new DeviceModel(
      //   UserDeviceData,
      // );

      // await this.userDeviceMongoRepository.save(UserDeviceDocument);

      return {
        status: ResultStatus.Success,
        data: {
          accessToken,
          refreshToken,
        },
      };
    }

    return {
      status: ResultStatus.Unauthorized,
      data: null,
    };
  }
}
