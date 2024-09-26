import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { DevicesPostgresRepository } from '../../../security/infrastructure/postgres/device-postgres.repository';

export class LogoutCommand {
  constructor(
    public readonly deviceId: string,
    public readonly iat: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly devicesPostgresRepository: DevicesPostgresRepository,
  ) {}

  async execute(command: LogoutCommand) {
    const { deviceId, iat } = command;

    const isDeleted: boolean =
      await this.devicesPostgresRepository.deleteOneByDeviceIdAndIAt(
        deviceId,
        iat,
      );

    if (!isDeleted) {
      // TODO: check error message
      return Result.unauthorized('Invalid or expired refresh token');
    }

    return Result.success();
  }
}