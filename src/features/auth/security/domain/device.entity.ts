// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { HydratedDocument, Model } from 'mongoose';
//
// @Schema()
// export class Device {
//   @Prop({
//     type: mongoose.Schema.Types.ObjectId,
//     maxLength: 50,
//     required: true,
//   })
//   userId: mongoose.Types.ObjectId;
//
//   @Prop({
//     type: String,
//     maxLength: 50,
//     required: true,
//   })
//   deviceId: string;
//
//   @Prop({
//     type: String,
//     maxLength: 50,
//     required: true,
//   })
//   iat: string;
//
//   @Prop({
//     type: String,
//     // maxLength: 100,
//     required: true,
//   })
//   deviceName: string;
//
//   @Prop({
//     type: String,
//     maxLength: 20,
//     required: true,
//   })
//   ip: string;
//
//   @Prop({
//     type: String,
//     maxLength: 50,
//     required: true,
//   })
//   exp: string;
// }
//
// export const DeviceSchema = SchemaFactory.createForClass(Device);
//
// // Types
// export type DeviceDocument = HydratedDocument<Device>;
// export type DeviceModelType = Model<DeviceDocument>; //& DeviceModelStaticType;
