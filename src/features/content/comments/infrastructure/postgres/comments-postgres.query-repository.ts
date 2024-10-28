// import { Injectable } from '@nestjs/common';
// import { InjectDataSource } from '@nestjs/typeorm';
// import { DataSource } from 'typeorm';
// import {
//   CommentOutputModel,
//   CommentOutputModelMapper,
// } from '../../api/models/output/comment.output.model';
// import {
//   Pagination,
//   PaginationOutput,
// } from '../../../../../base/models/pagination.base.model';
// import { PaginationQuery } from '../../../../../base/models/pagination-query.input.model';
//
// @Injectable()
// export class CommentsTypeormQueryRepository {
//   constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
//
//   getAllPostComments(
//     pagination: Pagination<PaginationQuery>,
//     postId: number,
//     userId?: number,
//   ): any {
//     const params = [postId];
//     const whereClause = `WHERE c.post_id = $1`;
//
//     return this.__getResult(whereClause, pagination, params, userId);
//   }
//
//   private async __getResult(
//     filter: any,
//     pagination: Pagination<PaginationQuery>,
//     params: any[],
//     userId?: number,
//   ): Promise<PaginationOutput<CommentOutputModel>> {
//     let userLikeStatusClause = '';
//
//     if (userId) {
//       userLikeStatusClause += `(
//         SELECT cl.status
//         FROM comment_likes cl
//         WHERE cl.comment_id = c.id AND cl.author_id = $${params.length + 1}
//       )`;
//       params.push(userId);
//     }
//
//     const query: string = `
//       SELECT c.id, c.content, c.created_at,
//       (
//         SELECT json_build_object(
//           'user_id', u.id,
//           'user_login', u.login
//         ) FROM users u
//         WHERE u.id = c.commentator_id
//       ) as "commentator_info",
//       json_build_object (
//         'likes_count', c.likes_count,
//         'dislikes_count', c.dislikes_count,
//         'my_status', ${userLikeStatusClause ? userLikeStatusClause : null}
//       ) as "likes_info"
//       FROM comments c
//       ${filter ? filter : ''}
//       ORDER BY c.${pagination.sortBy} ${pagination.sortDirection}
//       OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
//       LIMIT ${pagination.pageSize}
//     `;
//
//     const result = await this.dataSource.query(query, params);
//
//     const countQuery = `
//       SELECT count(*) as count
//       FROM comments c
//       ${filter ? filter : ''}
//     `;
//
//     const countResult = await this.dataSource.query(countQuery, [params[0]]);
//
//     const totalCount: number = Number(countResult[0].count);
//
//     const mappedComments = result.map(CommentOutputModelMapper);
//
//     return new PaginationOutput<CommentOutputModel>(
//       mappedComments,
//       pagination.pageNumber,
//       pagination.pageSize,
//       totalCount,
//     );
//   }
//
//   async findById(id: number, userId?: number): Promise<any> {
//     const params: any[] = [id];
//     const whereClause = 'WHERE c.id = $1';
//     let userLikeStatusClause = '';
//
//     if (userId) {
//       userLikeStatusClause += `(
//         SELECT cl.status
//         FROM comment_likes cl
//         WHERE cl.comment_id = c.id AND cl.author_id = $${params.length + 1}
//        )
//       `;
//       params.push(userId);
//     }
//
//     const query: string = `
//       SELECT c.id, c.content, c.created_at,
//       (
//         SELECT json_build_object(
//           'user_id', u.id,
//           'user_login', u.login
//         ) FROM users u
//         WHERE u.id = c.commentator_id
//       ) as commentator_info,
//       json_build_object(
//         'likes_count', c.likes_count,
//         'dislikes_count', c.dislikes_count,
//         'my_status', ${userLikeStatusClause ? userLikeStatusClause : null}
//       ) as likes_info
//       FROM comments c
//       ${whereClause}
//     `;
//
//     const result = await this.dataSource.query(query, params);
//
//     return result.length > 0 ? CommentOutputModelMapper(result[0]) : null;
//   }
// }
