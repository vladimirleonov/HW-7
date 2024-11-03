import {
  Column,
  Entity,
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

  // @Column()
  // postId: number;

  @Column({ length: 300, collation: 'C' })
  content: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  commentator: User;

  @Column()
  commentatorId: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
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
