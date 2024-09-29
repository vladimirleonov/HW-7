import { DeviceOutputModelMapper } from '../../api/models/output/device.output.model';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

export class DevicesPostgresQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAllForOutputByUserId(userId: number): Promise<any> {
    const query: string = `
      SELECT * from device
      WHERE user_id=$1
    `;

    const result = await this.dataSource.query(query, [userId]);

    return result.length > 0 ? result.map(DeviceOutputModelMapper) : [];
  }
}
