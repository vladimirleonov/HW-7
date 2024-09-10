import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RefreshTokenAuthGuard } from '../../../core/guards/passport/refresh-token-auth.guard';
import { CurrentDeviceId } from '../../../core/decorators/param-decorators/current-device-id.param.decorator';
import { DeviceQueryRepository } from '../infrastructure/device.query-repository';
import { CurrentUserIdFromDevice } from '../../../core/decorators/param-decorators/current-user-id-from-device.param.decorator';
import { DeviceOutputModel } from './models/output/device.output.model';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { CommandBus } from '@nestjs/cqrs';
import { TerminateAllOtherUserDevicesCommand } from '../application/use-cases/terminate-all-other-user-devices.usecase';

@Controller('security/devices')
export class SecurityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly deviceQueryRepository: DeviceQueryRepository,
  ) {}

  @Get()
  @UseGuards(RefreshTokenAuthGuard)
  async getUserDevices(
    @CurrentUserIdFromDevice() userId: string,
    @CurrentDeviceId() deviceId: string,
  ) {
    // console.log('userId', userId);
    // console.log('deviceId', deviceId);
    const userDevices: DeviceOutputModel[] =
      await this.deviceQueryRepository.findAllForOutputByUserId(userId);
    return userDevices;
  }

  @Delete()
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(204)
  async terminateAllOtherUserDevices(
    @CurrentUserIdFromDevice() userId: string,
    @CurrentDeviceId() deviceId: string,
  ) {
    const result = await this.commandBus.execute(
      new TerminateAllOtherUserDevicesCommand(deviceId, userId),
    );

    // const result: Result =
    //   await this.securityService.terminateAllOtherDeviceSessions(dto);
    if (result.status === ResultStatus.Success) {
      return;
    }
  }
}
