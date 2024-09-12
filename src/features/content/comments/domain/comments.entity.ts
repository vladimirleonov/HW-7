import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Like, LikeSchema, LikeStatus } from '../../like/domain/like.entity';

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
    type: [LikeSchema],
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
    required: true,
  })
  createdAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods.getUserLikeStatusByUserId = function (
  userId: string,
): LikeStatus {
  const userLike = this.likes.find(
    (like: Like): boolean => like.authorId.toString() === userId,
  );

  return userLike ? userLike.status : 'None';
};

export type CommentDocument = HydratedDocument<Comment> & {
  getUserLikeStatusByUserId(userId: string): LikeStatus;
};

export type CommentModelType = Model<CommentDocument>; //& DeviceModelStaticType;
