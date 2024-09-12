import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { UserDocument } from '../../../../users/domain/user.entity';
import { randomUUID } from 'node:crypto';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../../../security/domain/device.entity';
import { unixToISOString } from '../../../../../core/utils/convert-unix-to-iso';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { DevicesRepository } from '../../../security/infrastructure/device.repository';
import { JwtPayload } from 'jsonwebtoken';

export class LoginCommand {
  constructor(
    public readonly userId: string,
    public readonly ip: string,
    public readonly deviceName: string,
    public readonly refreshToken: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly devicesRepository: DevicesRepository,
    private readonly jwtService: JwtService,
    @InjectModel(Device.name) private readonly DeviceModel: DeviceModelType,
  ) {}

  async execute(command: LoginCommand) {
    if (command.refreshToken) {
      try {
        this.jwtService.verify(command.refreshToken);

        return Result.unauthorized(
          'Refresh token is still valid. Logout before logging in again',
        );
      } catch (err) {
        // console.log('Invalid refresh token, proceeding with login')
      }
    }

    const user: UserDocument | null = await this.userRepository.findById(
      command.userId,
    );

    if (!user) {
      return Result.unauthorized('User not found');
    }

    if (!user.emailConfirmation.isConfirmed) {
      return Result.unauthorized('Email is not confirmed');
    }

    // new payload for access token
    const JwtAccessTokenPayload = {
      userId: command.userId,
    };

    const deviceId: string = randomUUID();

    // new payload for refresh token
    const JwtRefreshTokenPayload = {
      userId: command.userId,
      deviceId: deviceId,
    };

    // generate access token
    const accessToken = await this.jwtService.signAsync(JwtAccessTokenPayload, {
      secret: 'secret',
    });

    //generate refresh token
    const refreshToken: string = await this.jwtService.signAsync(
      JwtRefreshTokenPayload,
      {
        secret: 'secret',
        expiresIn: '20s',
      },
    );

    const decodedRefreshToken: string | JwtPayload | null =
      this.jwtService.decode(refreshToken);

    // create device
    if (decodedRefreshToken && typeof decodedRefreshToken !== 'string') {
      const { iat, exp } = decodedRefreshToken;

      const deviceName: string = command.deviceName;
      const ip: string = command.ip;

      const newDevice: DeviceDocument = new this.DeviceModel({
        userId: command.userId,
        deviceId: decodedRefreshToken.deviceId,
        iat: unixToISOString(iat),
        deviceName: deviceName,
        ip: ip,
        exp: unixToISOString(exp),
      });

      await this.devicesRepository.save(newDevice);

      return Result.success({
        accessToken,
        refreshToken,
      });
    }

    return Result.unauthorized();
  }
}
