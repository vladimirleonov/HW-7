import { DeviceOutputModelMapper } from '../../api/models/output/device.output.model';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

export class DevicesPostgresQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAllForOutputByUserId(userId: number): Promise<any> {
    // const userSessions = await this.deviceModel.find({
    //   userId: userId,
    // });

    // return userSessions.map(DeviceOutputModelMapper);

    const query: string = `
      SELECT * from device
      WHERE user_id=$1
    `;
    console.log(query);

    const result = await this.dataSource.query(query, [userId]);
    console.log(result);

    return result.length > 0 ? result.map(DeviceOutputModelMapper) : [];
  }
}
