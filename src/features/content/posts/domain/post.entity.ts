import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../../blogs/domain/blog.entity';
import { Comment } from '../../comments/domain/comment.entity';
import { PostLike } from '../../like/domain/like.entity';

@Entity()
@Index(['id', 'blogId'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, collation: 'C' })
  @Index('idx_title')
  title: string;

  @Column({ length: 100, collation: 'C' })
  shortDescription: string;

  @Column({ length: 1000, collation: 'C' })
  content: string;

  @ManyToOne(() => Blog, (b) => b.posts, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: Blog;

  @Column()
  blogId: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @Index('idx_post_created_at')
  createdAt: Date;

  @OneToMany(() => Post, (c) => c.comments, { onDelete: 'CASCADE' })
  comments: Comment[];

  @OneToMany(() => PostLike, (l) => l.post, { onDelete: 'CASCADE' })
  likes: PostLike[];
}
