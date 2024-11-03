import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from '../../domain/device.entity';
import { DeviceOutputModel } from '../../api/models/output/device.output.model';

export class DevicesTypeormQueryRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async findAllForOutputByUserId(userId: number): Promise<DeviceOutputModel[]> {
    const result: DeviceOutputModel[] = await this.deviceRepository
      .createQueryBuilder('d')
      .select([
        'd.ip as ip',
        'd.deviceName as title',
        'd.iat as "lastActiveDate"',
        'd.deviceId as "deviceId"',
      ])
      .where('d.userId = :userId', { userId })
      .getRawMany();

    return result;
  }
}
