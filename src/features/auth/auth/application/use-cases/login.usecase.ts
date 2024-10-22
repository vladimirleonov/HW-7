import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { unixToISOString } from '../../../../../core/utils/convert-unix-to-iso';
import { JwtService } from '@nestjs/jwt';
import { UsersTypeormRepository } from '../../../../users/infrastructure/typeorm/users-typeorm.repository';
import { DevicesTypeormRepository } from '../../../security/infrastructure/typeorm/device-typeorm.repository';
import { JwtPayload } from 'jsonwebtoken';

export class LoginCommand {
  constructor(
    public readonly userId: number,
    public readonly ip: string,
    public readonly deviceName: string,
    public readonly refreshToken: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly usersTypeormRepository: UsersTypeormRepository,
    private readonly devicesTypeormRepository: DevicesTypeormRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand) {
    // console.log('command.refreshToken', command.refreshToken);
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

    const user: any = await this.usersTypeormRepository.findById(
      command.userId,
    );
    // console.log('get user login usecase', user);

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

    const decodedRefreshToken: string | JwtPayload | null =
      this.jwtService.decode(refreshToken);

    // create device
    if (decodedRefreshToken && typeof decodedRefreshToken !== 'string') {
      const { iat, exp } = decodedRefreshToken;

      const deviceName: string = command.deviceName;
      const ip: string = command.ip;

      await this.devicesTypeormRepository.create(
        command.userId,
        decodedRefreshToken.deviceId,
        unixToISOString(iat),
        deviceName,
        ip,
        unixToISOString(exp),
      );

      return Result.success({
        accessToken,
        refreshToken,
      });
    }

    return Result.unauthorized();
  }
}
