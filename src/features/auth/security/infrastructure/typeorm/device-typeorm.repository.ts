import { Injectable } from '@nestjs/common';
import { DeleteResult, Not, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from '../../domain/device.entity';

@Injectable()
export class DevicesTypeormRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    //private readonly dataSource: DataSource
  ) {}
  async deleteOneByDeviceIdAndIAt(
    deviceId: string,
    iat: string,
  ): Promise<boolean> {
    // const query: string = `
    //   DELETE FROM device WHERE device_id = $1 AND iat = $2
    // `;
    //
    // const result = await this.dataSource.query(query, [deviceId, iat]);
    //
    // const deletedRows: number = result[1];
    //
    // return deletedRows > 0;

    const result: DeleteResult = await this.deviceRepository.delete({
      deviceId,
      iat: new Date(iat),
    });

    return result.affected === 1;
  }

  async findByDeviceId(deviceId: string): Promise<any> {
    // const query: string = `
    //   SELECT * FROM device
    //   WHERE device_id = $1
    // `;
    //
    // const result = await this.dataSource.query(query, [deviceId]);
    //
    // return result.length > 0 ? result[0] : null;

    // Device | null
    return this.deviceRepository.findOneBy({ deviceId: deviceId });
  }

  async findOneByDeviceIdAndIat(deviceId: string, iat: string): Promise<any> {
    // const query: string = `
    //   SELECT * FROM device
    //   WHERE device_id = $1 AND iat = $2
    // `;
    //
    // const result = await this.dataSource.query(query, [deviceId, iat]);
    //
    // return result.length > 0 ? result[0] : null;

    // Device | null
    return this.deviceRepository.findOne({
      where: {
        deviceId,
        iat: new Date(iat),
      },
    });
  }

  async create(
    userId: number,
    deviceId: string,
    iat: string,
    deviceName: string,
    ip: string,
    exp: string,
  ) {
    // const query: string = `
    //   INSERT INTO device(user_id, device_id, iat, device_name, ip, exp)
    //   VALUES ($1, $2, $3, $4, $5, $6)
    // `;

    // const result = await this.dataSource.query(query, [
    //   userId,
    //   deviceId,
    //   iat,
    //   deviceName,
    //   ip,
    //   exp,
    // ]);
    //
    // return result.length > 0 ? result[0] : null;

    const newDevice: Device = this.deviceRepository.create({
      deviceId: deviceId,
      userId: userId,
      iat: new Date(iat),
      deviceName: deviceName,
      ip: ip,
      exp: new Date(exp),
    });

    const createdDevice: Device = await this.deviceRepository.save(newDevice);

    return createdDevice;
  }

  async updateIat(deviceId: string, iat: string): Promise<any> {
    // const query: string = `
    //   UPDATE device
    //   SET iat=$1
    //   WHERE device_id = $2
    // `;
    //
    // const result = await this.dataSource.query(query, [iat, deviceId]);
    //
    // const updatedRows = result[1];
    //
    // return updatedRows > 0;

    const result: UpdateResult = await this.deviceRepository.update(deviceId, {
      iat: new Date(iat),
    });

    return result.affected === 1;
  }

  async deleteAllOtherByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
  ): Promise<any> {
    // const query: string = `
    //   DELETE FROM device
    //   WHERE device_id <> $1 AND user_id = $2
    // `;
    //
    // const result = await this.dataSource.query(query, [deviceId, userId]);
    //
    // const deletedRowsCount: number = result[1];
    //
    // return deletedRowsCount > 0;

    const result: DeleteResult = await this.deviceRepository.delete({
      deviceId: Not(deviceId),
      userId,
    });

    return result.affected ? result.affected > 0 : false;
  }

  async deleteOneByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
  ): Promise<boolean> {
    // const query: string = `
    //   DELETE FROM device
    //   WHERE device_id = $1 AND user_id = $2
    // `;
    //
    // const result = await this.dataSource.query(query, [deviceId, userId]);
    //
    // const deletedRowsCount: number = result[1];
    //
    // return deletedRowsCount > 0;

    const result: DeleteResult = await this.deviceRepository.delete({
      deviceId,
      userId,
    });

    return result.affected === 1;
  }
}
