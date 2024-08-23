import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Device {
  @Prop({
    type: String,
    maxLength: 50,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    maxLength: 50,
    required: true,
  })
  deviceId: string;

  @Prop({
    type: String,
    maxLength: 50,
    required: true,
  })
  iat: string;

  @Prop({
    type: String,
    maxLength: 100,
    required: true,
  })
  deviceName: string;

  @Prop({
    type: String,
    maxLength: 20,
    required: true,
  })
  ip: string;

  @Prop({
    type: String,
    maxLength: 50,
    required: true,
  })
  exp: string;
}

export type DeviceDocument = HydratedDocument<Device>;

export const DeviceSchema = SchemaFactory.createForClass(Device);
