import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../../auth/domain/device.entity';

@Injectable()
export class DeviceRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) {}
  async save(device: DeviceDocument): Promise<DeviceDocument> {
    return device.save();
  }
  // async findByField(
  //   field: string,
  //   value: string,
  // ): Promise<DeviceDocument | null> {
  //   return this.DeviceModel.findOne({ [field]: value });
  // }
  // async findUserByLoginOrEmailField(
  //   loginOrEmail: string,
  // ): Promise<DeviceDocument | null> {
  //   return this.DeviceModel.findOne({
  //     $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
  //   });
  // }
  // async delete(id: string): Promise<boolean> {
  //   const deletedInfo = await this.DeviceModel.deleteOne({ _id: id });
  //   return deletedInfo.deletedCount === 1;
  // }
}
