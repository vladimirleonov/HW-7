import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../domain/device.entity';

@Injectable()
export class DeviceRepository {
  constructor(@InjectModel(Device.name) private deviceModel: DeviceModelType) {}

  async save(device: DeviceDocument): Promise<DeviceDocument> {
    return device.save();
  }

  async deleteOneByDeviceIdAndIAt(
    deviceId: string,
    iat: string,
  ): Promise<boolean> {
    const deletedInfo = await this.deviceModel.deleteOne({
      deviceId: { $eq: deviceId },
      iat: { $eq: iat },
    });

    return deletedInfo.deletedCount === 1;
  }

  async deleteAllOtherByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<void> {
    await this.deviceModel.deleteMany({
      deviceId: { $ne: deviceId },
      userId: { $eq: userId },
    });
  }

  async deleteOneByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    const deletedInfo = await this.deviceModel.deleteOne({
      deviceId: { $eq: deviceId },
      userId: { $eq: userId },
    });

    return deletedInfo.deletedCount === 1;
  }

  async findByDeviceId(deviceId: string): Promise<DeviceDocument | null> {
    return this.deviceModel.findOne({ deviceId });
  }
}
