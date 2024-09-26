import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AuthenticatedUserModelMapper,
  UserOutputModel,
  UserOutputModelMapper,
} from '../../api/models/output/user.output.model';
import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../../base/models/pagination.base.model';

@Injectable()
export class UsersPostgresQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getAll(
    pagination: PaginationWithSearchLoginAndEmailTerm,
  ): Promise<PaginationOutput<any>> {
    let whereClause = '';
    const params: string[] = [];

    // const searchLoginTermFilter = pagination.searchLoginTerm
    //   ? { login: { $regex: pagination.searchLoginTerm, $options: 'i' } }
    //   : {};
    if (pagination.searchLoginTerm) {
      whereClause += `login ILIKE $${params.length + 1}`;
      params.push(`%${pagination.searchLoginTerm}%`);
    }

    // const searchEmailTermFilter = pagination.searchEmailTerm
    //   ? { email: { $regex: pagination.searchEmailTerm, $options: 'i' } }
    //   : {};
    if (pagination.searchEmailTerm) {
      if (whereClause) whereClause += ' OR ';
      whereClause += `email ILIKE $${params.length + 1}`;
      params.push(`%${pagination.searchEmailTerm}%`);
    }

    // const orFilters = [searchLoginTermFilter, searchEmailTermFilter].filter(
    //   (filter) => Object.keys(filter).length > 0,
    // );
    const finalWhereClause = whereClause ? `WHERE ${whereClause}` : '';

    // const filter = orFilters.length > 0 ? { $or: orFilters } : {};

    return this._getResult(finalWhereClause, pagination, params);
  }

  async findById(id: string): Promise<any> {
    const query: string = `SELECT * FROM users WHERE id=$1`;

    const result = await this.dataSource.query(query, [id]);

    return result.length > 0 ? UserOutputModelMapper(result[0]) : null;
  }

  // // TODO: not sure about name
  async findAuthenticatedUserById(id: string): Promise<any> {
    const query: string = `SELECT * FROM users WHERE id=$1`;

    const result = await this.dataSource.query(query, [id]);

    return result.length > 0 ? AuthenticatedUserModelMapper(result[0]) : null;
  }
  //
  // // TODO: change type any
  private async _getResult(
    filter: any,
    pagination: PaginationWithSearchLoginAndEmailTerm,
    params: string[],
  ) {
    //: Promise<PaginationOutput<any>>

    const query: string = `
      SELECT * FROM users
      ${filter ? filter : ''}
      ORDER BY ${pagination.sortBy} ${pagination.sortDirection}
      OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
      LIMIT ${pagination.pageSize}
    `;

    const result = await this.dataSource.query(query, params);

    // count documents with filter
    const countQuery: string = `
      SELECT COUNT(*) as count FROM users
      ${filter ? filter : ''}
    `;

    const countResult = await this.dataSource.query(countQuery, params);
    // console.log('countResult', countResult);
    const totalCount: number = Number(countResult[0].count);

    const mappedUsers: any[] = result.map(UserOutputModelMapper);

    return new PaginationOutput<UserOutputModel>(
      mappedUsers,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
