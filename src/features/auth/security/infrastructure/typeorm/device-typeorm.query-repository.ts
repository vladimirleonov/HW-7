import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import { Device } from '../../domain/device.entity';
import { DeviceOutputModelMapper } from '../../api/models/output/device.output.model';

export class DevicesTypeormQueryRepository {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async findAllForOutputByUserId(userId: number): Promise<any> {
    // Device[] | []
    const result: Device[] = await this.deviceRepository.find({
      where: { userId },
    });

    return result.map(DeviceOutputModelMapper);
  }
}
