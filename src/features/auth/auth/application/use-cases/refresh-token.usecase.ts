import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceDocument } from '../../../security/domain/device.entity';
import { DevicesRepository } from '../../../security/infrastructure/device.repository';
import { Result } from '../../../../../base/types/object-result';
import { JwtService } from '@nestjs/jwt';
import { unixToISOString } from '../../../../../core/utils/convert-unix-to-iso';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public iat: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler {
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { deviceId, userId, iat: issuedAt } = command;

    const device: DeviceDocument | null =
      await this.devicesRepository.findOneByDeviceIdAndIat(deviceId, issuedAt);

    if (!device) {
      return Result.unauthorized('Invalid refresh token');
    }

    const JwtAccessTokenPayload = {
      userId: userId,
    };

    const JwtRefreshTokenPayload = {
      userId: userId,
      deviceId: deviceId,
    };

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

    const decodedRefreshToken = this.jwtService.decode(refreshToken);

    if (decodedRefreshToken) {
      const { iat } = decodedRefreshToken;

      const issuedAt: string = unixToISOString(iat);

      device.iat = issuedAt;

      await this.devicesRepository.save(device);

      return Result.success({
        accessToken,
        refreshToken,
      });
    }
    return Result.unauthorized();
  }
}
