import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeviceOutputModel } from '../models/output/device.output.model';
import { DevicesTypeormQueryRepository } from '../../infrastructure/typeorm/device-typeorm.query-repository';

export class GetAllDevicesQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetAllDevicesQuery)
export class GetAllDevicesUseCase implements IQueryHandler {
  constructor(
    private readonly devicesTypeormQueryRepository: DevicesTypeormQueryRepository,
  ) {}

  execute(query: GetAllDevicesQuery): Promise<DeviceOutputModel[]> {
    const { userId } = query;

    return this.devicesTypeormQueryRepository.findAllForOutputByUserId(userId);
  }
}
