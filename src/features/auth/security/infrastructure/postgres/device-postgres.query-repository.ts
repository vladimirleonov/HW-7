import { DeviceOutputModelMapper } from '../../api/models/output/device.output.model';
import { DataSource } from 'typeorm';

export class DevicesPostgresQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAllForOutputByUserId(userId: string): Promise<any> {
    // const userSessions = await this.deviceModel.find({
    //   userId: userId,
    // });

    // return userSessions.map(DeviceOutputModelMapper);

    const query: string = `
      SELECT * from devices
      WHERE user_id=$1
    `;

    const result = await this.dataSource.query(query, [userId]);

    return result.length > 0 ? result.map(DeviceOutputModelMapper) : [];
  }
}
