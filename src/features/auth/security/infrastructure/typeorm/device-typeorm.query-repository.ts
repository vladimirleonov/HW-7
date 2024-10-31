import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import { Device } from '../../domain/device.entity';

export class DevicesTypeormQueryRepository {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async findAllForOutputByUserId(userId: number): Promise<any> {
    const result = await this.deviceRepository
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

    // Device[] | []
    // const result: Device[] = await this.deviceRepository.find({
    //   where: { userId },
    // });
    //
    // return result.map(DeviceOutputModelMapper);
  }
}
