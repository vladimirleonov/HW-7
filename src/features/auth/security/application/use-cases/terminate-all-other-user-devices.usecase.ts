import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../infrastructure/device.repository';
import { Result } from '../../../../../base/types/object-result';

export class TerminateAllOtherUserDevicesCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(TerminateAllOtherUserDevicesCommand)
export class TerminateAllOtherUserDevicesUseCase
  implements ICommandHandler<TerminateAllOtherUserDevicesCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(command: TerminateAllOtherUserDevicesCommand) {
    const { deviceId, userId } = command;

    await this.devicesRepository.deleteAllOtherByDeviceIdAndUserId(
      deviceId,
      userId,
    );

    return Result.success();
  }
}
