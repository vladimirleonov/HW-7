import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../infrastructure/device.repository';
import { DeviceDocument } from '../../domain/device.entity';
import { Result } from '../../../../../base/types/object-result';

export class TerminateUserDeviceCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(TerminateUserDeviceCommand)
export class TerminateUserDeviceUseCase
  implements ICommandHandler<TerminateUserDeviceCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(command: TerminateUserDeviceCommand) {
    const { deviceId, userId } = command;

    const device: DeviceDocument | null =
      await this.devicesRepository.findByDeviceId(deviceId);
    if (!device) {
      return Result.notFound(`Device with id ${deviceId} does not exist`);
    }

    if (device.userId.toString() !== userId) {
      return Result.forbidden(
        `You do not have permission to delete this device`,
      );
    }

    await this.devicesRepository.deleteOneByDeviceIdAndUserId(deviceId, userId);

    return Result.success();
  }
}
