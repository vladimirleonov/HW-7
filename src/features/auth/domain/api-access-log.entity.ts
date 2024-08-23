import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class ApiAccessLog {
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
  URL: string;

  @Prop({
    type: Date,
    maxLength: 50,
    required: true,
  })
  date: string;
}

export type ApiAccessLogDocument = HydratedDocument<ApiAccessLog>;

export const ApiAccessLogSchema = SchemaFactory.createForClass(ApiAccessLog);
