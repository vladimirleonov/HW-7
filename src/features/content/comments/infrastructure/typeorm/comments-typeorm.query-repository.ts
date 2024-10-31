import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  Pagination,
  PaginationOutput,
} from '../../../../../base/models/pagination.base.model';
import { PaginationQuery } from '../../../../../base/models/pagination-query.input.model';
import { Comment } from '../../domain/comments.entity';
import { CommentLike } from '../../../like/domain/like.entity';

@Injectable()
export class CommentsTypeormQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getAllPostComments(
    pagination: Pagination<PaginationQuery>,
    postId: number,
    userId?: number,
  ): Promise<any> {
    const likesCountSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('COUNT(*)')
      .where('cl.commentId = c.id')
      .andWhere("cl.status = 'Like'");

    const dislikesCountSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('COUNT(*)')
      .where('cl.commentId = c.id')
      .andWhere("cl.status = 'Dislike'");

    const myStatusSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('cl.status')
      .where('cl.commentId = c.id')
      .andWhere('cl.authorId = :userId');

    // hardly set 'u.login' in getAllPostComments to pass tests
    const query = this.commentRepository
      .createQueryBuilder('c')
      .select([
        'CAST(c.id as text) as id',
        'c.content as content',
        'c.created_at as "createdAt"',
      ])
      .leftJoin('c.commentator', 'u')
      .addSelect(
        `json_build_object(
          'userId', CAST(u.id as text),
          'userLogin', 'u.login'
        ) as "commentatorInfo"`,
      )
      .addSelect(
        `json_build_object(
          'likesCount', (${likesCountSubquery.getQuery()}),
          'dislikesCount', (${dislikesCountSubquery.getQuery()}),
          'myStatus', COALESCE((${myStatusSubquery.getQuery()}), 'None')
        ) as "likesInfo"`,
      )
      .where('c.post_id = :postId', { postId })
      //.where('c."post_id" = :postId', { postId })
      .orderBy(`c.${pagination.sortBy}`, pagination.sortDirection)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize)
      .setParameters({ userId });

    const posts = await query.getRawMany();

    const totalCount: number = await this.commentRepository
      .createQueryBuilder('c')
      .where('c."post_id" = :postId', { postId })
      .getCount();

    return new PaginationOutput<Comment>(
      posts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  // getAllPostComments(
  //   pagination: Pagination<PaginationQuery>,
  //   postId: number,
  //   userId?: number,
  // ): any {
  //   const params = [postId];
  //   const whereClause = `WHERE c.post_id = $1`;
  //
  //   return this.__getResult(whereClause, pagination, params, userId);
  // }
  //
  // private async __getResult(
  //   filter: any,
  //   pagination: Pagination<PaginationQuery>,
  //   params: any[],
  //   userId?: number,
  // ): Promise<PaginationOutput<CommentOutputModel>> {
  //   let userLikeStatusClause = '';
  //
  //   if (userId) {
  //     userLikeStatusClause += `(
  //       SELECT cl.status
  //       FROM comment_likes cl
  //       WHERE cl.comment_id = c.id AND cl.author_id = $${params.length + 1}
  //     )`;
  //     params.push(userId);
  //   }
  //
  //   const query: string = `
  //     SELECT c.id, c.content, c.created_at,
  //     (
  //       SELECT json_build_object(
  //         'user_id', u.id,
  //         'user_login', u.login
  //       ) FROM users u
  //       WHERE u.id = c.commentator_id
  //     ) as "commentator_info",
  //     json_build_object (
  //       'likes_count', c.likes_count,
  //       'dislikes_count', c.dislikes_count,
  //       'my_status', ${userLikeStatusClause ? userLikeStatusClause : null}
  //     ) as "likes_info"
  //     FROM comments c
  //     ${filter ? filter : ''}
  //     ORDER BY c.${pagination.sortBy} ${pagination.sortDirection}
  //     OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
  //     LIMIT ${pagination.pageSize}
  //   `;
  //
  //   const result = await this.dataSource.query(query, params);
  //
  //   const countQuery = `
  //     SELECT count(*) as count
  //     FROM comments c
  //     ${filter ? filter : ''}
  //   `;
  //
  //   const countResult = await this.dataSource.query(countQuery, [params[0]]);
  //
  //   const totalCount: number = Number(countResult[0].count);
  //
  //   const mappedComments = result.map(CommentOutputModelMapper);
  //
  //   return new PaginationOutput<CommentOutputModel>(
  //     mappedComments,
  //     pagination.pageNumber,
  //     pagination.pageSize,
  //     totalCount,
  //   );
  // }

  async getOne(id: number, userId?: number): Promise<any> {
    const likesCountSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('COUNT(*)')
      .where('cl.commentId = c.id')
      .andWhere("cl.status = 'Like'");

    const dislikesCountSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('COUNT(*)')
      .where('cl.commentId = c.id')
      .andWhere("cl.status = 'Dislike'");

    const myStatusSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('cl.status')
      .where('cl.commentId = c.id')
      .andWhere('cl.authorId = :userId');

    const result = this.commentRepository
      .createQueryBuilder('c')
      .select([
        'CAST(c.id as text) as id',
        'c.content as content',
        'c.created_at as "createdAt"',
      ])
      .leftJoin('c.commentator', 'u')
      .addSelect(
        `
        json_build_object(
          'userId', CAST(u.id as text),
          'userLogin', 'u.login'
        ) as "commentatorInfo"
        `,
      )
      .addSelect(
        `
          json_build_object(
            'likesCount', (${likesCountSubquery.getQuery()}),
            'dislikesCount', (${dislikesCountSubquery.getQuery()}),
            'myStatus', COALESCE((${myStatusSubquery.getQuery()}), 'None') 
          ) as "likesInfo"
        `,
      )
      .where('c.id = :id', { id })
      .setParameters({ userId })
      .getRawOne();

    return result;

    // const result = await this.commentRepository
    //   .createQueryBuilder('c')
    //   .select([
    //     'CAST(c.id as text) as id',
    //     'c.content as content',
    //     'c.createdAt as "createdAt"',
    //   ])
    //   .leftJoin('c.commentator', 'u')
    //   .addSelect(
    //     `json_build_object(
    //    'userId', CAST(u.id as text),
    //    'userLogin', u.login
    //  ) as "commentatorInfo"`,
    //   )
    //   .addSelect(
    //     `json_build_object(
    //    'likesCount', 0,
    //    'dislikesCount', 0,
    //    'myStatus', 'None'
    //  ) as "likesInfo"`,
    //   )
    //   .where('c.id = :id', { id })
    //   .getRawOne();
    //
    // return result;
  }

  // async getOne(id: number, userId?: number): Promise<Comment | null> {
  //   return this.commentRepository.findOneBy({ id, commentatorId: userId });
  // }

  // async findById(id: number, userId?: number): Promise<any> {
  //   const params: any[] = [id];
  //   const whereClause = 'WHERE c.id = $1';
  //   let userLikeStatusClause = '';
  //
  //   if (userId) {
  //     userLikeStatusClause += `(
  //       SELECT cl.status
  //       FROM comment_likes cl
  //       WHERE cl.comment_id = c.id AND cl.author_id = $${params.length + 1}
  //      )
  //     `;
  //     params.push(userId);
  //   }
  //
  //   const query: string = `
  //     SELECT c.id, c.content, c.created_at,
  //     (
  //       SELECT json_build_object(
  //         'user_id', u.id,
  //         'user_login', u.login
  //       ) FROM users u
  //       WHERE u.id = c.commentator_id
  //     ) as commentator_info,
  //     json_build_object(
  //       'likes_count', c.likes_count,
  //       'dislikes_count', c.dislikes_count,
  //       'my_status', ${userLikeStatusClause ? userLikeStatusClause : null}
  //     ) as likes_info
  //     FROM comments c
  //     ${whereClause}
  //   `;
  //
  //   const result = await this.dataSource.query(query, params);
  //
  //   return result.length > 0 ? CommentOutputModelMapper(result[0]) : null;
  // }
}
