import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import { User } from '../../../users/domain/user.entity';
import { CommentLike } from '../../like/domain/like.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, (p) => p.comments, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Post;

  @Column()
  @Index('idx_post_id')
  postId: number;

  @Column({ length: 300, collation: 'C' })
  content: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  commentator: User;

  @Column()
  @Index('idx_commentator_id')
  commentatorId: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @Index('idx_comment_created_at')
  createdAt: Date;

  @OneToMany(() => CommentLike, (l) => l.comment, { onDelete: 'CASCADE' })
  likes: CommentLike[];

  static create(post: Post, ccmmentator: User, content: string): Comment {
    const comment: Comment = new this();
    comment.post = post;
    comment.commentator = ccmmentator;
    comment.content = content;
    comment.createdAt = new Date();
    return comment;
  }
}
