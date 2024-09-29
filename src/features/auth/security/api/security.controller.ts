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
import { DevicesPostgresQueryRepository } from '../infrastructure/postgres/device-postgres.query-repository';
import { CurrentUserIdFromDevice } from '../../../../core/decorators/param-decorators/current-user-id-from-device.param.decorator';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { CommandBus } from '@nestjs/cqrs';
import { TerminateAllOtherUserDevicesCommand } from '../application/use-cases/terminate-all-other-user-devices.usecase';
import { TerminateUserDeviceCommand } from '../application/use-cases/terminate-user-device.usecase';
import { NotFoundException } from '../../../../core/exception-filters/http-exception-filter';
import { ParseUUIDPipe } from '../../../../core/pipes/parse-uuid.pipe';

@Controller('security/devices')
export class SecurityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly devicesPostgresQueryRepository: DevicesPostgresQueryRepository,
  ) {}

  @Get()
  @UseGuards(RefreshTokenAuthGuard)
  async getUserDevices(
    @CurrentDeviceId() deviceId: string,
    @CurrentUserIdFromDevice() userId: number,
  ) {
    const userDevices =
      await this.devicesPostgresQueryRepository.findAllForOutputByUserId(
        userId,
      );
    return userDevices;
  }

  @Delete()
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateAllOtherUserDevices(
    @CurrentDeviceId() deviceId: string,
    @CurrentUserIdFromDevice() userId: number,
  ) {
    const result = await this.commandBus.execute(
      new TerminateAllOtherUserDevicesCommand(deviceId, userId),
    );

    if (result.status === ResultStatus.Success) {
      return;
    }
  }

  @Delete(':deviceId')
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateUserDevices(
    @Param('deviceId', new ParseUUIDPipe()) deviceId: string,
    @CurrentUserIdFromDevice() userId: number,
  ) {
    const result: Result = await this.commandBus.execute(
      new TerminateUserDeviceCommand(deviceId, userId),
    );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage);
    } else if (result.status === ResultStatus.Forbidden) {
      throw new ForbiddenException(result.errorMessage);
    } else if (result.status === ResultStatus.Success) {
      return;
    }
  }
}
