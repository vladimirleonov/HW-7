import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../../blogs/domain/blog.entity';
import { Comment } from '../../comments/domain/comments.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  title: string;

  @Column({ length: 100 })
  shortDescription: string;

  @Column({ length: 1000 })
  content: string;

  @ManyToOne(() => Blog, (b) => b.posts, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: Blog;

  @Column()
  blogId: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  dislikesCount: number;

  @OneToMany(() => Post, (c) => c.comments, { onDelete: 'CASCADE' })
  comments: Comment[];
}
