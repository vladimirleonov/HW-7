import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { unixToISOString } from '../../../../../core/utils/convert-unix-to-iso';
import { JwtService } from '@nestjs/jwt';
import { UsersPostgresRepository } from '../../../../users/infrastructure/postgresql/users-postgres.repository';
import { DevicesPostgresRepository } from '../../../security/infrastructure/postgres/device-postgres.repository';
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
    private readonly usersPostgresRepository: UsersPostgresRepository,
    private readonly devicesPostgresRepository: DevicesPostgresRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand) {
    // console.log(
    //   this.jwtService.verify(command.refreshToken, {
    //     secret: 'secret',
    //   }),
    // );
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

    const user: any = await this.usersPostgresRepository.findById(
      command.userId,
    );

    // console.log('login user', user);

    if (!user) {
      return Result.unauthorized('User not found');
    }

    if (!user.emailConfirmationIsEmailConfirmed) {
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
      expiresIn: '10s',
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

      await this.devicesPostgresRepository.create(
        Number(command.userId),
        decodedRefreshToken.deviceId,
        unixToISOString(iat),
        deviceName,
        ip,
        unixToISOString(exp),
      );

      // const newDevice = new this.DeviceModel({
      //   userId: command.userId,
      //   deviceId: decodedRefreshToken.deviceId,
      //   iat: unixToISOString(iat),
      //   deviceName: deviceName,
      //   ip: ip,
      //   exp: unixToISOString(exp),
      // });

      // await this.devicesPostgresRepository.save(newDevice);

      return Result.success({
        accessToken,
        refreshToken,
      });
    }

    return Result.unauthorized();
  }
}
