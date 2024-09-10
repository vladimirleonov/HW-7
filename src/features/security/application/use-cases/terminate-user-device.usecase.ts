import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../infrastructure/device.repository';
import { DeviceDocument } from '../../domain/device.entity';
import { Result } from '../../../../base/types/object-result';
import mongoose from 'mongoose';

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
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async execute(command: TerminateUserDeviceCommand) {
    const { deviceId, userId } = command;

    const device: DeviceDocument | null =
      await this.deviceRepository.findByDeviceId(deviceId);
    if (!device) {
      return Result.notFound(`Device with id ${deviceId} does not exist`);
    }

    if (device.userId.toString() !== userId) {
      return Result.notFound(
        `You do not have permission to delete this device`,
      );
    }

    await this.deviceRepository.deleteOneByDeviceIdAndUserId(deviceId, userId);

    return Result.success();
  }
}
