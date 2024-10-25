import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 15 })
  name: string;

  @Column({ length: 500 })
  description: string;

  @Column({ length: 100 })
  websiteUrl: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  isMembership: boolean;

  @OneToMany(() => Post, (p) => p.blog)
  posts: Post[];
}
