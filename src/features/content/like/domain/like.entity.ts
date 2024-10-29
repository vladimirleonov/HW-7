import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LikeStatus } from '../../../../base/types/like-status';
import { Comment } from '../../comments/domain/comments.entity';
import { Post } from '../../posts/domain/post.entity';
import { User } from '../../../users/domain/user.entity';

export abstract class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'enum', enum: LikeStatus })
  status: LikeStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  author: number;

  @Column()
  authorId: number;
}

@Entity()
export class CommentLike extends Like {
  @ManyToOne(() => Comment, (c) => c.likes, { onDelete: 'CASCADE' })
  @JoinColumn()
  comment: Comment;

  @Column()
  commentId: number;

  static create(commentId: number, userId: number, likeStatus: LikeStatus) {
    const comment = new this();
    comment.commentId = commentId;
    comment.authorId = userId;
    comment.status = likeStatus;

    return comment;
  }
}

@Entity()
export class PostLike extends Like {
  @ManyToOne(() => Post, (p) => p.likes, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Post;

  @Column()
  postId: number;

  static create(postId: number, userId: number, likeStatus: LikeStatus) {
    const comment = new this();
    comment.postId = postId;
    comment.authorId = userId;
    comment.status = likeStatus;

    return comment;
  }
}

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose from 'mongoose';
//
// export enum LikeStatus {
//   Like = 'Like',
//   Dislike = 'Dislike',
//   None = 'None',
// }
//
// @Schema()
// export class Like {
//   @Prop({
//     type: Date,
//     required: true,
//   })
//   createdAt: Date;
//
//   @Prop({
//     type: String,
//     enum: LikeStatus,
//     required: true,
//   })
//   status: string;
//
//   @Prop({
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//   })
//   authorId: mongoose.Types.ObjectId;
// }
//
// export const LikeSchema = SchemaFactory.createForClass(Like);
