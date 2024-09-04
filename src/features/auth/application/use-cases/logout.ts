import { ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../base/types/object-result';
import { DeviceRepository } from '../../../security/infrastructure/device.repository';

export class LogoutCommand {
  constructor(
    public readonly deviceId: string,
    public readonly iat: string,
  ) {}
}

export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async execute(command: LogoutCommand) {
    const { deviceId, iat } = command;

    const isDeleted: boolean =
      await this.deviceRepository.deleteOneByDeviceIdAndIAt(deviceId, iat);

    if (!isDeleted) {
      // TODO: check error message
      return Result.unauthorized('Invalid or expired refresh token');
    }

    return Result.success();
  }
}
