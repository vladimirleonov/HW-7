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

/* in this case
  .where('p.blog_id = :blogId', { blogId })
  .orderBy('title', 'DESC')
  it @Index('idx_blog_id_title', ['title', 'blogId'])
  will work
*/

@Entity()
@Index('idx_blog_id_blog_id', ['id', 'blogId'])
@Index('idx_blog_id_title', ['title', 'blogId'])
@Index('idx_blog_id_created_at', ['createdAt', 'blogId'])
// TODO:: ask about blogName. How to use it in index because it is in orderBy
// @Index('idx_blog_id_blog_name', ['blogName', 'blogId']) error blogName does not exist
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, collation: 'C' })
  // @Index('idx_title')
  title: string;

  @Column({ length: 100, collation: 'C' })
  shortDescription: string;

  @Column({ length: 1000, collation: 'C' })
  content: string;

  @ManyToOne(() => Blog, (b) => b.posts, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: Blog;

  @Column()
  @Index('idx_blog_id', ['blogId'])
  blogId: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  // @Index('idx_post_created_at')
  createdAt: Date;

  @OneToMany(() => Post, (c) => c.comments, { onDelete: 'CASCADE' })
  comments: Comment[];

  @OneToMany(() => PostLike, (l) => l.post, { onDelete: 'CASCADE' })
  likes: PostLike[];

  static create(
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
  ) {
    const post: Post = new this();

    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.blogId = blogId;

    return post;
  }
}
