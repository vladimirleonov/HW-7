import { Injectable } from '@nestjs/common';
import { DeleteResult, Not, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from '../../domain/device.entity';

@Injectable()
export class DevicesTypeormRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}
  async deleteOneByDeviceIdAndIAt(
    deviceId: string,
    iat: string,
  ): Promise<boolean> {
    const result: DeleteResult = await this.deviceRepository.delete({
      deviceId,
      iat: new Date(iat),
    });

    return result.affected === 1;
  }

  async findByDeviceId(deviceId: string): Promise<any> {
    // Device | null
    return this.deviceRepository.findOneBy({ deviceId: deviceId });
  }

  async findOneByDeviceIdAndIat(deviceId: string, iat: string): Promise<any> {
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
    const result: UpdateResult = await this.deviceRepository.update(deviceId, {
      iat: new Date(iat),
    });

    return result.affected === 1;
  }

  async deleteAllOtherByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
  ): Promise<any> {
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
    const result: DeleteResult = await this.deviceRepository.delete({
      deviceId,
      userId,
    });

    return result.affected === 1;
  }
}
