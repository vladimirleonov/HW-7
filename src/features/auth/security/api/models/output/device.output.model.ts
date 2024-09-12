import { DeviceDocument } from '../../../domain/device.entity';

export class DeviceOutputModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

// MAPPERS

export const DeviceOutputModelMapper = (
  device: DeviceDocument,
): DeviceOutputModel => {
  const outputModel: DeviceOutputModel = new DeviceOutputModel();

  outputModel.ip = device.ip;
  outputModel.title = device.deviceName;
  outputModel.lastActiveDate = device.iat;
  outputModel.deviceId = device.deviceId;

  return outputModel;
};
