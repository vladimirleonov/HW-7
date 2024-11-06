import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../posts/domain/post.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 15, collation: 'C' })
  name: string;

  @Column({ length: 500, collation: 'C' })
  description: string;

  @Column({ length: 100 })
  websiteUrl: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @Index('idx_created_at')
  createdAt: Date;

  @Column()
  isMembership: boolean;

  @OneToMany(() => Post, (p) => p.blog)
  posts: Post[];

  static create(
    name: string,
    description: string,
    websiteUrl: string,
    isMembership: boolean,
  ): Blog {
    const newBlog: Blog = new Blog();
    newBlog.name = name;
    newBlog.description = description;
    newBlog.websiteUrl = websiteUrl;
    newBlog.isMembership = isMembership;

    return newBlog;
  }
}
