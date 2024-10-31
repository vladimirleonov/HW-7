export class DeviceOutputModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

// MAPPERS

// export const DeviceOutputModelMapper = (device: any): DeviceOutputModel => {
//   const outputModel: DeviceOutputModel = new DeviceOutputModel();
//
//   outputModel.ip = device.ip;
//   outputModel.title = device.device_name;
//   outputModel.lastActiveDate = device.iat;
//   outputModel.deviceId = device.device_id;
//
//   return outputModel;
// };
