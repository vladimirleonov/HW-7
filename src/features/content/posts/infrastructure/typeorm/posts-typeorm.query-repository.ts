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
import { PostLike } from '../../../like/domain/like.entity';

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
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
  ) {}

  async getAllPosts(
    pagination: Pagination<PaginationQuery>,
    userId?: number,
  ): Promise<PaginationOutput<Post>> {
    console.log('userId', userId);

    const likeCountSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select('COUNT(*)')
      .where('pl.postId = p.id')
      .andWhere("pl.status = 'Like'");

    const dislikesCountSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select('COUNT(*)')
      .where('pl.postId = p.id')
      .andWhere("pl.status = 'Dislike'");

    const myStatusSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select('pl.status')
      .where('pl.postId=p.id')
      .andWhere('pl.authorId = :userId');

    const newestLikesSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select([
        'pl.createdAt as created_at',
        'pl.authorId as author_id',
        'u.login as login',
      ])
      .leftJoin('pl.author', 'u')
      .where('pl.postId = p.id')
      .andWhere("pl.status = 'Like'")
      .orderBy('pl.createdAt', 'DESC')
      .limit(3);

    const newestLikesJsonAgg = `
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'addedAt', nl.created_at,
              'userId', CAST(nl.author_id as text),
              'login', nl.login
            ) 
          ) 
          FROM (${newestLikesSubquery.getQuery()}) as nl
        ),
      '[]'::json
      )
    `;

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
      // .addSelect(`(${likeCountSubquery.getQuery()})`, 'likesCount')
      //.addSelect(`(${dislikesCountSubquery.getQuery()}) as "dislikesCount"`)
      //.addSelect(
      //  `COALESCE(${myStatusSubquery.getQuery()}, 'None') as "myStatus"`,
      //)
      // .addSelect(newestLikesSubquery + 'as "newestLikes"')
      .addSelect(
        `
        json_build_object(
          'likesCount', (${likeCountSubquery.getQuery()}),
          'dislikesCount', (${dislikesCountSubquery.getQuery()}),
          'myStatus', COALESCE((${myStatusSubquery.getQuery()}), 'None'),
          'newestLikes', ${newestLikesJsonAgg}
        ) as "extendedLikesInfo"
      `,
      )
      .leftJoin('p.blog', 'b')
      .orderBy(
        mapSortFieldsMapper(pagination.sortBy, postsSortFieldMapping),
        pagination.sortDirection,
      )
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize)
      .setParameters({ userId });

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
    const likesCountSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select('COUNT(*)')
      .where('pl.post_id = p.id')
      .andWhere("pl.status = 'Like'");

    const dislikesCountSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select('COUNT(*)')
      .where('pl.post_id = p.id')
      .andWhere("pl.status = 'Dislike'");

    const myStatusSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select('pl.status')
      .where('pl.post_id = p.id')
      .andWhere('pl.author_id = :userId');

    const newestLikesSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select([
        'pl.createdAt as created_at',
        'pl.authorId as author_id',
        'u.login as login',
      ])
      .innerJoin('pl.author', 'u')
      .where("pl.status = 'Like'")
      .andWhere('pl.post_id = p.id')
      .orderBy('pl.createdAt', 'DESC')
      .limit(3);

    const newestLikesJsonAgg = `
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'addedAt', nl.created_at,
              'userId', CAST(nl.author_id as text),
              'login', nl.login
            )
          )
          FROM (${newestLikesSubquery.getQuery()}) as nl
        ),
      '[]'::json
      )
    `;

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
          'likesCount', (${likesCountSubquery.getQuery()}),
          'dislikesCount', (${dislikesCountSubquery.getQuery()}),
          'myStatus', COALESCE((${myStatusSubquery.getQuery()}), 'None'),
          'newestLikes', ${newestLikesJsonAgg}
        ) as "extendedLikesInfo"`,
      )
      .leftJoin('p.blog', 'b')
      .where('p.blog_id = :blogId', { blogId })
      .orderBy(
        mapSortFieldsMapper(pagination.sortBy, postsSortFieldMapping),
        pagination.sortDirection,
      )
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize)
      .setParameters({ userId });

    const posts: Post[] = await query.getRawMany();
    // console.log('posts', posts);

    // optimization
    const totalCount: number = await this.postsRepository
      .createQueryBuilder('p')
      .where('p.blog_id = :blogId', { blogId })
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
    const likesCountSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select('COUNT(*)')
      .where('pl.post_id = :id')
      .andWhere("pl.status = 'Like'");

    const dislikesCountSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select('COUNT(*)')
      .where('pl.post_id = :id')
      .andWhere("pl.status = 'Dislike'");

    const myStatusSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select('pl.status')
      .where('pl.post_id = :id')
      .andWhere('pl.author_id = :userId');

    const newestLikesSubquery = this.postLikeRepository
      .createQueryBuilder('pl')
      .select([
        'pl.createdAt as created_at',
        'pl.authorId as author_id',
        'u.login as login',
      ])
      .innerJoin('pl.author', 'u')
      .where("pl.status = 'Like'")
      .andWhere('pl.post_id = :id')
      .orderBy('pl.createdAt', 'DESC')
      .limit(3);

    const newestLikesJsonAgg = `
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'addedAt', nl.created_at,
              'userId', CAST(nl.author_id as text),
              'login', nl.login
            )
          )
          FROM (${newestLikesSubquery.getQuery()}) as nl
        ),
      '[]'::json
      )
    `;

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
          'likesCount', (${likesCountSubquery.getQuery()}), 
          'dislikesCount', (${dislikesCountSubquery.getQuery()}), 
          'myStatus', COALESCE((${myStatusSubquery.getQuery()}), 'None'), 
          'newestLikes', ${newestLikesJsonAgg}
        ) as "extendedLikesInfo"`,
      )
      .leftJoin('p.blog', 'b')
      .where('p.id = :id', { id: id })
      .setParameters({ id, userId })
      .getRawOne();

    // console.log(result);

    return result;
  }
}
