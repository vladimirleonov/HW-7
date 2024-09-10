import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { RefreshTokenAuthGuard } from '../../../core/guards/passport/refresh-token-auth.guard';
import { CurrentDeviceId } from '../../../core/decorators/param-decorators/current-device-id.param.decorator';
import { DeviceQueryRepository } from '../infrastructure/device.query-repository';
import { CurrentUserIdFromDevice } from '../../../core/decorators/param-decorators/current-user-id-from-device.param.decorator';
import { DeviceOutputModel } from './models/output/device.output.model';

@Controller('security/devices')
export class SecurityController {
  constructor(private readonly deviceQueryRepository: DeviceQueryRepository) {}

  @Get()
  @UseGuards(RefreshTokenAuthGuard)
  async getUserDevices(
    @CurrentUserIdFromDevice() userId: string,
    @CurrentDeviceId() deviceId: string,
  ) {
    console.log('userId', userId);
    console.log('deviceId', deviceId);
    const userDevices: DeviceOutputModel[] =
      await this.deviceQueryRepository.findAllForOutputByUserId(userId);
    return userDevices;
  }
}
