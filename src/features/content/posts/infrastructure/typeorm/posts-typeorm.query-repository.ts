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
    console.log(totalCount);

    return new PaginationOutput<Post>(
      posts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  // +
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

    // let whereClause: string = '';
    // const params: string | number[] = [];
    //
    // whereClause += `WHERE p.blog_id=$${params.length + 1}`;
    // params.push(blogId);
    //
    // return this.__getResult(whereClause, pagination, params, userId);
  }

  // TODO: change type any
  // private async __getResult(
  //   filter: string,
  //   pagination: Pagination<PaginationQuery>,
  //   params: any = [],
  //   userId?: number,
  // ): Promise<any> {
  //   let userLikeStatusClause = '';
  //
  //   if (userId) {
  //     userLikeStatusClause += `(
  //       SELECT status
  //       FROM post_likes pl
  //       WHERE pl.post_id = p.id AND pl.author_id=$${params.length + 1}
  //      )`;
  //     params.push(userId);
  //   }
  //
  //   const query = `
  //     SELECT p.id, p.title, p.short_description, p.content, p.blog_id, p.created_at,
  //     (
  //       SELECT b.name as blog_name
  //       FROM blogs b
  //       WHERE b.id = p.blog_id
  //     ),
  //     json_build_object(
  //       'likes_count', p.likes_count,
  //       'dislikes_count', p.dislikes_count,
  //       'my_status', ${userLikeStatusClause ? userLikeStatusClause : null},
  //       'newest_likes', (
  //         SELECT json_agg(
  //           json_build_object(
  //             'added_at', recent_likes.created_at,
  //             'user_id', recent_likes.author_id,
  //             'login', recent_likes.login
  //           )
  //         )
  //         FROM (
  //           SELECT pl.created_at, pl.author_id, u.login
  //           FROM post_likes pl
  //           JOIN users u ON pl.author_id = u.id
  //           WHERE pl.post_id = p.id AND pl.status = 'Like'
  //           ORDER BY pl.created_at DESC
  //           LIMIT 3
  //         ) as recent_likes
  //       )
  //     ) as "extended_likes_info"
  //     FROM posts p
  //     ${filter}
  //     ORDER BY ${pagination.sortBy} ${pagination.sortDirection}
  //     OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
  //     LIMIT ${pagination.pageSize}
  //   `;
  //
  //   const result = await this.dataSource.query(query, params);
  //
  //   const countQuery = `
  //     SELECT count(*) as count
  //     FROM posts p
  //     ${filter}
  //   `;
  //
  //   const countResult = await this.dataSource.query(
  //     countQuery,
  //     filter ? [params[0]] : [],
  //   );
  //
  //   const totalCount: number = Number(countResult[0].count);
  //
  //   const mappedPosts = result.map(PostOutputModelMapper);
  //
  //   return new PaginationOutput<PostOutputModel>(
  //     mappedPosts,
  //     pagination.pageNumber,
  //     pagination.pageSize,
  //     totalCount,
  //   );
  // }

  // +
  async findById(id: number, userId?: number): Promise<any> {
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

    // console.log('findById result', result);

    return result;

    // const result = await this.postsRepository
    //   .createQueryBuilder('p')
    //   .select([
    //     'CAST(p.id as text)',
    //     'p.title as title',
    //     'p.shortDescription as "shortDescription"',
    //     'p.content as content',
    //     'p.createdAt as "createdAt"',
    //   ])
    //   .where('p.id = :id', { id: id })
    //   .getRawOne();
    //
    // console.log(result);
    // let userLikeStatusClause = '';
    // const params: number[] = [id];
    //
    // if (userId) {
    //   userLikeStatusClause += `(
    //     SELECT status
    //     FROM post_likes pl
    //     WHERE pl.post_id = p.id AND pl.author_id=$${params.length + 1}
    //    )`;
    //   params.push(userId);
    // }
    //
    // const query = `
    //   SELECT p.id, p.title, p.short_description, p.content, p.blog_id, p.created_at,
    //   (
    //     SELECT b.name
    //     FROM blogs b
    //     WHERE b.id = p.blog_id
    //   ) as "blog_name",
    //   json_build_object(
    //     'likes_count', p.likes_count,
    //     'dislikes_count', p.dislikes_count,
    //     'my_status', ${userLikeStatusClause ? userLikeStatusClause : null},
    //     'newest_likes', (
    //       SELECT json_agg(
    //         json_build_object(
    //           'added_at', recent_likes.created_at,
    //           'user_id', recent_likes.author_id,
    //           'login', recent_likes.login
    //         )
    //       )
    //       FROM (
    //         SELECT pl.created_at, pl.author_id, u.login
    //         FROM post_likes pl
    //         JOIN users u ON pl.author_id = u.id
    //         WHERE pl.post_id = p.id AND pl.status = 'Like'
    //         ORDER BY pl.created_at DESC
    //         LIMIT 3
    //       ) as recent_likes
    //     )
    //   ) as "extended_likes_info"
    //   FROM post p
    //   WHERE p.id = $1
    // `;
    //
    // const result = await this.dataSource.query(query, params);
    //
    // return result.length > 0 ? PostOutputModelMapper(result[0]) : null;
  }
}
