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
    // const byId: FilterQuery<Comment> = postId ? { postId: postId } : {};
    //
    // const orFilters: FilterQuery<Blog>[] = [byId].filter(
    //   (filter: FilterQuery<Blog>) => Object.keys(filter).length > 0,
    // );
    //
    // const filter = orFilters.length > 0 ? { $or: orFilters } : {};

    const params = [postId];
    const chereClause = `WHERE post_id = $1`;

    return this.__getResult(chereClause, pagination, params);
  }

  private async __getResult(
    filter: any,
    pagination: Pagination,
    params: any[],
    //userId: string,
  ): Promise<PaginationOutput<CommentOutputModel>> {
    // const comments = await this.commentModel
    //   .find(filter)
    //   .sort({
    //     [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
    //   })
    //   .skip(pagination.getSkipItemsCount())
    //   .limit(pagination.pageSize);

    const query: string = `
      SELECT c.id, c.content, c.created_at, u.id as "userId", u.login FROM comments c
      LEFT JOIN users u
      ON c.commentator_id = u.id
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

    // const totalCount: number = await this.commentModel.countDocuments(filter);
    //
    // const mappedComments: CommentOutputModel[] = comments.map((comment) =>
    //   CommentOutputModelMapper(comment, userId),
    // );
    //
    // return new PaginationOutput<CommentOutputModel>(
    //   mappedComments,
    //   pagination.pageNumber,
    //   pagination.pageSize,
    //   totalCount,
    // );
  }

  async findById(id: number, userId?: number): Promise<any> {
    let query: string = `
      SELECT c.id, c.content, c.created_at, u.id as "userId", u.login FROM comments c
      LEFT JOIN users u
      ON c.commentator_id = u.id
      WHERE c.id = $1
    `;
    const params = [id];

    console.log('findById query', query);
    console.log('userId', userId);

    if (userId !== undefined && userId !== null) {
      query += ` AND u.id = $2 `;
      params.push(userId!);
    }

    const result = await this.dataSource.query(query, params);
    // {
    //   id: 23,
    //   content: 'length_21-weqweqweqwq',
    //   created_at: '23:36:21.443526+03',
    //   userId: 679,
    //   login: 'test12345'
    // }

    console.log('findById result', result);

    return result.length > 0 ? CommentOutputModelMapper(result[0]) : null;
  }

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
