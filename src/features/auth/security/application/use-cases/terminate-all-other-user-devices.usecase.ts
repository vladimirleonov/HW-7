import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesTypeormRepository } from '../../infrastructure/typeorm/device-typeorm.repository';
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
    private readonly devicesTypeormRepository: DevicesTypeormRepository,
  ) {}

  async execute(command: TerminateAllOtherUserDevicesCommand) {
    const { deviceId, userId } = command;

    await this.devicesTypeormRepository.deleteAllOtherByDeviceIdAndUserId(
      deviceId,
      userId,
    );

    return Result.success();
  }
}
