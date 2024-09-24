import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesPostgresRepository } from '../../infrastructure/postgres/device-postgres.repository';
import { Result } from '../../../../../base/types/object-result';

export class TerminateAllOtherUserDevicesCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: number,
  ) {}
}

@CommandHandler(TerminateAllOtherUserDevicesCommand)
export class TerminateAllOtherUserDevicesUseCase
  implements ICommandHandler<TerminateAllOtherUserDevicesCommand>
{
  constructor(
    private readonly devicesPostgresRepository: DevicesPostgresRepository,
  ) {}

  async execute(command: TerminateAllOtherUserDevicesCommand) {
    const { deviceId, userId } = command;

    await this.devicesPostgresRepository.deleteAllOtherByDeviceIdAndUserId(
      deviceId,
      userId,
    );

    return Result.success();
  }
}
