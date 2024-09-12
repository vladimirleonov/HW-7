import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @Prop({
    type: String,
    maxlength: 15,
    required: true,
  })
  name: string;
  @Prop({
    type: String,
    maxlength: 500,
    required: true,
  })
  description: string;
  @Prop({
    type: String,
    maxlength: 100,
    required: true,
    match:
      /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  })
  websiteUrl: string;
  @Prop({
    type: Date,
    // validators: {
    //   validator: isValidISOString,
    //   message: "createdAt must be a valid ISO string",
    // },
    required: true,
  })
  createdAt: Date;
  @Prop({
    type: Boolean,
    default: false,
  })
  isMembership: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
