import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesPostgresRepository } from '../../../security/infrastructure/postgres/device-postgres.repository';
import { Result } from '../../../../../base/types/object-result';
import { JwtService } from '@nestjs/jwt';
import { unixToISOString } from '../../../../../core/utils/convert-unix-to-iso';
import { UsersTypeormRepository } from '../../../../users/infrastructure/typeorm/users-typeorm.repository';

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
    private readonly devicesPostgresRepository: DevicesPostgresRepository,
    private readonly usersTypeormRepository: UsersTypeormRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { deviceId, userId, iat: issuedAt } = command;

    const device = await this.devicesPostgresRepository.findOneByDeviceIdAndIat(
      deviceId,
      issuedAt,
    );

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
      expiresIn: '10h',
    });

    //generate refresh token
    const refreshToken: string = await this.jwtService.signAsync(
      JwtRefreshTokenPayload,
      {
        secret: 'secret',
        expiresIn: '20h',
      },
    );

    const decodedRefreshToken = this.jwtService.decode(refreshToken);

    if (decodedRefreshToken) {
      const { iat } = decodedRefreshToken;

      const issuedAt: string = unixToISOString(iat);

      await this.devicesPostgresRepository.updateIat(deviceId, issuedAt);

      return Result.success({
        accessToken,
        refreshToken,
      });
    }
    return Result.unauthorized();
  }
}
