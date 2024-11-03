import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RefreshTokenAuthGuard } from '../../../../core/guards/passport/refresh-token-auth.guard';
import { CurrentDeviceId } from '../../../../core/decorators/param-decorators/current-device-id.param.decorator';
import { CurrentUserIdFromDevice } from '../../../../core/decorators/param-decorators/current-user-id-from-device.param.decorator';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TerminateAllOtherUserDevicesCommand } from '../application/use-cases/terminate-all-other-user-devices.usecase';
import { TerminateUserDeviceCommand } from '../application/use-cases/terminate-user-device.usecase';
import { NotFoundException } from '../../../../core/exception-filters/http-exception-filter';
import { ParseUUIDPipe } from '../../../../core/pipes/parse-uuid.pipe';
import { DeviceOutputModel } from './models/output/device.output.model';
import { GetAllDevicesQuery } from './queries/get-all-devices.query';

@Controller('security/devices')
@UseGuards(RefreshTokenAuthGuard)
export class SecurityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getUserDevices(
    @CurrentDeviceId() deviceId: string,
    @CurrentUserIdFromDevice() userId: number,
  ) {
    const result: DeviceOutputModel[] = await this.queryBus.execute<
      GetAllDevicesQuery,
      DeviceOutputModel[]
    >(new GetAllDevicesQuery(userId));

    return result;
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateAllOtherUserDevices(
    @CurrentDeviceId() deviceId: string,
    @CurrentUserIdFromDevice() userId: number,
  ) {
    const result: Result = await this.commandBus.execute<
      TerminateAllOtherUserDevicesCommand,
      Result
    >(new TerminateAllOtherUserDevicesCommand(deviceId, userId));

    if (result.status === ResultStatus.Success) {
      return;
    }
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateUserDevices(
    @Param('deviceId', new ParseUUIDPipe()) deviceId: string,
    @CurrentUserIdFromDevice() userId: number,
  ) {
    const result: Result = await this.commandBus.execute<
      TerminateUserDeviceCommand,
      Result
    >(new TerminateUserDeviceCommand(deviceId, userId));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage);
    } else if (result.status === ResultStatus.Forbidden) {
      throw new ForbiddenException(result.errorMessage);
    } else if (result.status === ResultStatus.Success) {
      return;
    }
  }
}
