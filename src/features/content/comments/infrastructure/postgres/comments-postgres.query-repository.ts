import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CommentOutputModel,
  CommentOutputModelMapper,
} from '../../api/models/output/comment.output.model';
import {
  Pagination,
  PaginationOutput,
} from '../../../../../base/models/pagination.base.model';

@Injectable()
export class CommentsPostgresQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  getAllPostComments(
    pagination: Pagination,
    postId: number,
    userId: number,
  ): any {
    const params = [postId];
    const whereClause = `WHERE post_id = $1`;

    return this.__getResult(whereClause, pagination, params);
  }

  private async __getResult(
    filter: any,
    pagination: Pagination,
    params: any[],
    //userId: string,
  ): Promise<PaginationOutput<CommentOutputModel>> {
    // const query: string = `
    //   SELECT c.id, c.content, c.created_at, u.id as "userId", u.login FROM comments c
    //   LEFT JOIN users u
    //   ON c.commentator_id = u.id
    //   ${filter ? filter : ''}
    //   ORDER BY ${pagination.sortBy} ${pagination.sortDirection}
    //   OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
    //   LIMIT ${pagination.pageSize}
    // `;

    const query: string = `
      SELECT c.id, c.content, c.created_at, 
      (
        SELECT json_build_object(
          'userId', u.id,
          'userLogin', u.login  
        )
        FROM users u
        WHERE u.id = c.commentator_id  
      ) as "commentatorInfo",
      json_build_object (
        'myStatus', 'None',
        'likesCount', c.likes_count,
        'dislikesCount', c.dislikes_count  
      ) as "likesInfo"
      FROM comments c
      ${filter ? filter : ''}
      ORDER BY ${pagination.sortBy} ${pagination.sortDirection}
      OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
      LIMIT ${pagination.pageSize}
    `;

    const result = await this.dataSource.query(query, params);

    const countQuery = `
      SELECT count(*)
      FROM comments 
      ${filter ? filter : ''}
    `;

    const countResult = await this.dataSource.query(countQuery, params);

    const totalCount: number = Number(countResult[0].count);

    const mappedComments = result.map(CommentOutputModelMapper);

    return new PaginationOutput<CommentOutputModel>(
      mappedComments,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  async findById(id: number, userId?: number): Promise<any> {
    const params: any[] = [id];
    const whereClause = 'WHERE c.id = $1';
    let userLikeStatusClause = '';

    console.log('userId', userId);
    if (userId) {
      userLikeStatusClause += `(
        SELECT cl.status
        FROM comment_likes cl
        WHERE cl.comment_id = c.id AND cl.author_id = $${params.length + 1}
       ) 
      `;
      params.push(userId);
    }

    const query: string = `
      SELECT c.id, c.content, c.created_at,
      (
        SELECT json_build_object(
          'user_id', u.id,
          'user_login', u.login
        ) FROM users u 
        WHERE u.id = c.commentator_id
      ) as commentator_info, 
      json_build_object(
        'likes_count', c.likes_count,
        'dislikes_count', c.dislikes_count,
        'my_status', ${userLikeStatusClause ? userLikeStatusClause : null}
      ) as likes_info
      FROM comments c
      ${whereClause}
    `;

    console.log('query', query);

    const result = await this.dataSource.query(query, params);
    console.log('result', result);

    return result.length > 0 ? CommentOutputModelMapper(result[0]) : null;

    // let query: string = `
    //   SELECT c.id, c.content, c.created_at, u.id as "userId", u.login FROM comments c
    //   LEFT JOIN users u
    //   ON c.commentator_id = u.id
    //   WHERE c.id = $1
    // `;

    // console.log('findById query', query);

    //   if (userId !== undefined && userId !== null) {
    //     query += ` AND u.id = $2 `;
    //     params.push(userId!);
    //   }
    //
    //   const result = await this.dataSource.query(query, params);
    //
    //   console.log('findById result', result);
    //
    //   return result.length > 0 ? CommentOutputModelMapper(result[0]) : null;
    // }

    // async findByIdWithOptionalUserId(id: number, userId?: number): Promise<any> {
    //   let query: string = `
    //     SELECT c.id, c.content, c.created_at, u.id as "userId", u.login FROM comments c
    //     LEFT JOIN users u
    //     ON c.commentator_id = u.id
    //     WHERE c.id = $1
    //   `;
    //   const params = [id];
    //
    //   if (userId !== undefined || userId !== null) {
    //     query += ` AND u.id = $2 `;
    //     params.push(userId);
    //   }
    //
    //   console.log('findById query', query);
    //
    //   const result = await this.dataSource.query(query, params);
    //
    //   return result.length > 0 ? CommentOutputModelMapper(result[0]) : null;
    // }
  }
}
