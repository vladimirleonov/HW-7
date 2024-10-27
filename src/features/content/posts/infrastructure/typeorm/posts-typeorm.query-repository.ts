import { Injectable } from '@nestjs/common';
import {
  Pagination,
  PaginationOutput,
} from '../../../../../base/models/pagination.base.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationQuery } from '../../../../../base/models/pagination-query.input.model';
import { Post } from '../../domain/post.entity';
import { mapSortFieldsMapper } from '../../../../../core/utils/sort-field-mapper';

const postsSortFieldMapping = {
  title: 'p.title',
  blog_name: 'b.name',
  created_at: 'p.created_at',
};

@Injectable()
export class PostsTypeormQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
  ) {}

  async getAllPosts(
    pagination: Pagination<PaginationQuery>,
    userId?: number,
  ): Promise<PaginationOutput<Post>> {
    const query = this.postsRepository
      .createQueryBuilder('p')
      .select([
        'CAST(p.id as text) as id',
        'p.title as title',
        'p.shortDescription as "shortDescription"',
        'p.content as content',
        'CAST(p.blogId as text) as "blogId"',
        'b.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .addSelect(
        `
        json_build_object(
          'likesCount', 0,
          'dislikesCount', 0,
          'myStatus', 'None',
          'newestLikes', '[]':: jsonb
        ) as "extendedLikesInfo"
      `,
      )
      .leftJoin('p.blog', 'b')
      .orderBy(
        mapSortFieldsMapper(pagination.sortBy, postsSortFieldMapping),
        pagination.sortDirection,
      )
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize);

    const posts: Post[] = await query.getRawMany();

    //optimization
    const totalCount: number = await this.postsRepository
      .createQueryBuilder('p')
      .getCount();

    // const totalCount: number = await query.getCount();
    // console.log(totalCount);

    return new PaginationOutput<Post>(
      posts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  async getAllBlogPosts(
    pagination: Pagination<PaginationQuery>,
    blogId: number,
    userId?: number,
  ): Promise<PaginationOutput<Post>> {
    const query = this.postsRepository
      .createQueryBuilder('p')
      .select([
        'p.id::text as id',
        'p.title as title',
        'p.shortDescription as "shortDescription"',
        'p.content as content',
        'p.blog_id::text as "blogId"',
        'b.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .addSelect(
        `
        json_build_object(
          'likesCount', 0,
          'dislikesCount', 0,
          'myStatus', 'None',
          'newestLikes', '[]':: jsonb
        ) as "extendedLikesInfo"`,
      )
      .leftJoin('p.blog', 'b')
      .where('p.blog_id = :blogId', { blogId })
      .orderBy(
        mapSortFieldsMapper(pagination.sortBy, postsSortFieldMapping),
        pagination.sortDirection,
      )
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize);

    const posts: Post[] = await query.getRawMany();
    // console.log('posts', posts);

    // optimization
    const totalCount: number = await this.postsRepository
      .createQueryBuilder('p')
      .getCount();
    //const totalCount: number = await query.getCount();
    // console.log('totalCount', totalCount);

    return new PaginationOutput<Post>(
      posts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  async getOne(id: number, userId?: number): Promise<any> {
    const result = await this.postsRepository
      .createQueryBuilder('p')
      .select([
        'p.id::text as id',
        'p.title as title',
        'p.shortDescription as "shortDescription"',
        'p.content as content',
        'CAST(b.id as text) as "blogId"',
        'b.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .addSelect(
        `json_build_object(
          'likesCount', 0, 
          'dislikesCount', 0, 
          'myStatus', 'None', 
          'newestLikes', '[]'::jsonb
        ) as "extendedLikesInfo"`,
      )
      .leftJoin('p.blog', 'b')
      .where('p.id = :id', { id: id })
      .getRawOne();

    // console.log(result);

    return result;
  }
}
