// import { InjectModel } from '@nestjs/mongoose';
// import { Device, DeviceModelType } from '../../domain/device.entity';
// import {
//   DeviceOutputModel,
//   DeviceOutputModelMapper,
// } from '../../api/models/output/device.output.model';
//
// export class DeviceQueryRepository {
//   constructor(@InjectModel(Device.name) private deviceModel: DeviceModelType) {}
//
//   async findAllForOutputByUserId(userId: string): Promise<DeviceOutputModel[]> {
//     const userSessions: Device[] = await this.deviceModel.find({
//       userId: userId,
//     });
//
//     return userSessions.map(DeviceOutputModelMapper);
//   }
// }
