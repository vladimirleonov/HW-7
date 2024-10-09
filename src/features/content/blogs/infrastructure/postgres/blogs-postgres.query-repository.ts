import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  Pagination,
  PaginationOutput,
  PaginationWithSearchNameTerm,
} from '../../../../../base/models/pagination.base.model';
import {
  BlogOutputModel,
  BlogOutputModelMapper,
} from '../../api/models/output/blog.output.model';
import {
  PaginationQuery,
  PaginationWithSearchNameTermQuery,
} from '../../../../../base/models/pagination-query.input.model';

@Injectable()
export class BlogsPostgresQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getAll(
    pagination: PaginationWithSearchNameTerm<PaginationWithSearchNameTermQuery>,
  ): Promise<PaginationOutput<BlogOutputModel>> {
    let whereClause: string = '';
    const params: string[] = [];

    if (pagination.searchNameTerm) {
      whereClause += `name ILIKE $${params.length + 1}`;
      params.push(`%${pagination.searchNameTerm}%`);
    }

    const finalWhereClause = whereClause ? `WHERE ${whereClause}` : '';

    return this._getResult(finalWhereClause, pagination, params);
  }

  async findById(id: number) {
    const query: string = `
      SELECT * FROM blogs
      WHERE id = $1
    `;

    const result: string = await this.dataSource.query(query, [id]);

    return result.length > 0 ? BlogOutputModelMapper(result[0]) : null;
  }

  async _getResult(
    filter: any,
    pagination: Pagination<PaginationQuery>,
    params: any,
  ): Promise<PaginationOutput<BlogOutputModel>> {
    const query: string = `
      SELECT * FROM blogs
      ${filter ? filter : ''}
      ORDER BY ${pagination.sortBy} ${pagination.sortDirection}
      OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
      LIMIT ${pagination.pageSize}
    `;

    const result = await this.dataSource.query(query, params);

    // count docs
    const countQuery: string = `
      SELECT COUNT(*) as count FROM blogs
      ${filter ? filter : ''}
    `;

    const countResult = await this.dataSource.query(countQuery, params);

    const totalCount: number = Number(countResult[0].count);

    const mappedBlogs: any[] = result.map(BlogOutputModelMapper);

    return new PaginationOutput<BlogOutputModel>(
      mappedBlogs,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
