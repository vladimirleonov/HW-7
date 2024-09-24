// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument, Model } from 'mongoose';
//
// @Schema()
// export class ApiAccessLog {
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
//   URL: string;
//
//   @Prop({
//     type: Date,
//     maxLength: 50,
//     required: true,
//   })
//   date: string;
// }
//
// export const ApiAccessLogSchema = SchemaFactory.createForClass(ApiAccessLog);
//
// // Types
// export type ApiAccessLogDocument = HydratedDocument<ApiAccessLog>;
// export type ApiAccessLogModelType = Model<ApiAccessLog>;
