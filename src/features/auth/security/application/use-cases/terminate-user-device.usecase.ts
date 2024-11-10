import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesTypeormRepository } from '../../infrastructure/typeorm/device-typeorm.repository';
import { Result } from '../../../../../base/types/object-result';
import { Device } from '../../domain/device.entity';

export class TerminateUserDeviceCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: number,
  ) {}
}

@CommandHandler(TerminateUserDeviceCommand)
export class TerminateUserDeviceUseCase
  implements ICommandHandler<TerminateUserDeviceCommand>
{
  constructor(
    private readonly devicesTypeormRepository: DevicesTypeormRepository,
  ) {}

  async execute(command: TerminateUserDeviceCommand): Promise<Result> {
    const { deviceId, userId } = command;

    const device: Device | null =
      await this.devicesTypeormRepository.findByDeviceId(deviceId);

    if (!device) {
      return Result.notFound(`Device with id ${deviceId} does not exist`);
    }

    if (device.userId !== userId) {
      return Result.forbidden(
        `You do not have permission to delete this device`,
      );
    }

    await this.devicesTypeormRepository.deleteOneByDeviceIdAndUserId(
      deviceId,
      userId,
    );

    return Result.success();
  }
}
