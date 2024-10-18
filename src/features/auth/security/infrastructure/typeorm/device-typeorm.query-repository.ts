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
    // const query: string = `
    //   SELECT * from device
    //   WHERE user_id=$1
    // `;
    //
    // const result = await this.dataSource.query(query, [userId]);
    //
    // return result.length > 0 ? result.map(DeviceOutputModelMapper) : [];

    // Device | null
    const result: Device | null = await this.deviceRepository.findOneBy({
      userId,
    });

    return result ? DeviceOutputModelMapper(result) : null;
  }
}
