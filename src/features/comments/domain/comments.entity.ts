import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Like, likeSchema, LikeStatus } from '../../like/domain/like.entity';
import { DeviceDocument } from '../../security/domain/device.entity';

@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  userId: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    maxlength: 300,
    required: true,
  })
  userLogin: string;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

@Schema()
export class Comment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    maxlength: 300,
    required: true,
  })
  postId: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    maxlength: 1000,
    required: true,
  })
  content: string;

  @Prop({
    type: CommentatorInfoSchema,
    required: true,
  })
  commentatorInfo: CommentatorInfo;

  @Prop({
    type: [likeSchema],
    required: true,
  })
  likes: Like[];

  @Prop({
    type: Number,
    default: 0,
    min: 0,
    required: true,
  })
  likesCount: number;

  @Prop({
    type: Number,
    default: 0,
    required: true,
  })
  dislikesCount: number;

  @Prop({
    type: Date,
    // validate: {
    //   validator: isValidISOString,
    //   message: 'createdAt must be a valid ISO string',
    // },
    required: true,
  })
  createdAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods.getUserLikeStatusByUserId = function (
  userId: string,
): LikeStatus {
  console.log('in getUserLikeStatusByUserId', userId);
  const userLike = this.likes.find(
    (like: Like): boolean => like.authorId.toString() === userId,
  );
  console.log('userLike', userLike);
  return userLike ? userLike.status : 'None';
};

export type CommentDocument = HydratedDocument<Comment> & {
  getUserLikeStatusByUserId(userId: string): LikeStatus;
};

export type CommentModelType = Model<CommentDocument>; //& DeviceModelStaticType;
