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

  async save(device: Device): Promise<void> {
    await this.deviceRepository.save(device);
  }

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

  async findByDeviceId(deviceId: string): Promise<Device | null> {
    // Device | null
    return this.deviceRepository.findOneBy({ deviceId: deviceId });
  }

  async findOneByDeviceIdAndIat(
    deviceId: string,
    iat: string,
  ): Promise<Device | null> {
    // Device | null
    return this.deviceRepository.findOne({
      where: {
        deviceId,
        iat: new Date(iat),
      },
    });
  }

  async updateIat(deviceId: string, iat: string): Promise<boolean> {
    const result: UpdateResult = await this.deviceRepository.update(deviceId, {
      iat: new Date(iat),
    });

    return result.affected === 1;
  }

  async deleteAllOtherByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
  ): Promise<boolean> {
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
