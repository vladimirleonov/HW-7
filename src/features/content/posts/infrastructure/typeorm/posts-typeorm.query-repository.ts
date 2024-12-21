import { Injectable } from '@nestjs/common';
import {
  Pagination,
  PaginationOutput,
} from '../../../../../base/models/pagination.base.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryParams } from '../../../../../base/models/pagination-query.input.model';
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
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
  ) {}

  async getAllPosts(
    pagination: Pagination<PaginationQueryParams>,
    userId?: number,
  ): Promise<PaginationOutput<Post>> {
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
      // .orderBy(
      //   mapSortFieldsMapper(pagination.sortBy, postsSortFieldMapping),
      //   pagination.sortDirection,
      // )
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize)
      .setParameters({ userId });

    for (const sortItem of pagination.sort) {
      query.addOrderBy(
        mapSortFieldsMapper(sortItem.field, postsSortFieldMapping),
        sortItem.direction,
      );
    }

    const posts: Post[] = await query.getRawMany();

    //optimization
    const totalCount: number = await this.postsRepository
      .createQueryBuilder('p')
      .getCount();

    return new PaginationOutput<Post>(
      posts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  async getAllBlogPosts(
    pagination: Pagination<PaginationQueryParams>,
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
      // .orderBy(
      //   mapSortFieldsMapper(pagination.sortBy, postsSortFieldMapping),
      //   pagination.sortDirection,
      // )
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize)
      .setParameters({ userId });

    for (const sortItem of pagination.sort) {
      query.addOrderBy(
        mapSortFieldsMapper(sortItem.field, postsSortFieldMapping),
        sortItem.direction,
      );
    }

    const posts: Post[] = await query.getRawMany();

    // optimization
    const totalCount: number = await this.postsRepository
      .createQueryBuilder('p')
      .where('p.blog_id = :blogId', { blogId })
      .getCount();

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

    return result;
  }
}
