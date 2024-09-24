import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesPostgresRepository } from '../../infrastructure/postgres/device-postgres.repository';
import { Result } from '../../../../../base/types/object-result';

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
    private readonly devicesPostgresRepository: DevicesPostgresRepository,
  ) {}

  async execute(command: TerminateUserDeviceCommand) {
    const { deviceId, userId } = command;

    const device =
      await this.devicesPostgresRepository.findByDeviceId(deviceId);
    if (!device) {
      return Result.notFound(`Device with id ${deviceId} does not exist`);
    }

    if (device.user_id !== userId) {
      return Result.forbidden(
        `You do not have permission to delete this device`,
      );
    }

    await this.devicesPostgresRepository.deleteOneByDeviceIdAndUserId(
      deviceId,
      userId,
    );

    return Result.success();
  }
}
