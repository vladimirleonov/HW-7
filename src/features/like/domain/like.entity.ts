import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

@Schema()
export class Like {
  @Prop({
    type: Date,
    // validate: {
    //   validator: isValidISOString,
    //   message: "createdAt must be a valid ISO string",
    // },
    required: true,
  })
  createdAt: Date;

  @Prop({
    type: String,
    enum: LikeStatus,
    required: true,
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  authorId: mongoose.Types.ObjectId;
}

export const likeSchema = SchemaFactory.createForClass(Like);
