import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LikeStatus } from '../../../../base/types/like-status';
import { Comment } from '../../comments/domain/comment.entity';
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
@Index(['commentId', 'status'])
@Index(['commentId', 'authorId'])
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
