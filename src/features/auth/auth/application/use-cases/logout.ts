import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { DevicesTypeormRepository } from '../../../security/infrastructure/typeorm/device-typeorm.repository';

export class LogoutCommand {
  constructor(
    public readonly deviceId: string,
    public readonly iat: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly devicesTypeormRepository: DevicesTypeormRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<Result> {
    const { deviceId, iat } = command;

    const isDeleted: boolean =
      await this.devicesTypeormRepository.deleteOneByDeviceIdAndIAt(
        deviceId,
        iat,
      );

    if (!isDeleted) {
      return Result.unauthorized('Invalid or expired token');
    }

    return Result.success();
  }
}
