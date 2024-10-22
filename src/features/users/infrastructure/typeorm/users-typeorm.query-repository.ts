import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../../base/models/pagination.base.model';
import { UsersPaginationQuery } from '../../api/models/input/users-pagination-query.input.model';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersTypeormQueryRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    // private readonly dataSource: DataSource,
  ) {}

  async getAll(
    pagination: PaginationWithSearchLoginAndEmailTerm<UsersPaginationQuery>,
  ): Promise<any> {
    // console.log(pagination.searchLoginTerm);
    const query = this.usersRepository
      .createQueryBuilder('u')
      .select([
        'CAST(u.id AS text) AS id',
        'u.login as login',
        'u.email as email',
        'u.createdAt as "createdAt"',
      ])
      .orderBy(`u.${pagination.sortBy}`, pagination.sortDirection)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize);

    if (pagination.searchLoginTerm) {
      query.where('u.login ILIKE :searchLoginTerm', {
        searchLoginTerm: `%${pagination.searchLoginTerm}%`,
      });
    }

    if (pagination.searchEmailTerm) {
      query.andWhere('u.email ILIKE :searchEmailTerm', {
        searchEmailTerm: `%${pagination.searchEmailTerm}%`,
      });
    }
    //console.log(query);

    const users: User[] = await query.getRawMany();
    console.log('users', users);

    const totalCount: number = await query.getCount();
    // console.log('totalCount', totalCount);

    return new PaginationOutput<User>(
      users,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  // async getAll(
  //   pagination: PaginationWithSearchLoginAndEmailTerm<UsersPaginationQuery>,
  // ): Promise<PaginationOutput<any>> {
  //   let whereClause = '';
  //   const params: string[] = [];
  //
  //   if (pagination.searchLoginTerm) {
  //     whereClause += `login ILIKE $${params.length + 1}`;
  //     params.push(`%${pagination.searchLoginTerm}%`);
  //   }
  //
  //   if (pagination.searchEmailTerm) {
  //     if (whereClause) whereClause += ' OR ';
  //     whereClause += `email ILIKE $${params.length + 1}`;
  //     params.push(`%${pagination.searchEmailTerm}%`);
  //   }
  //
  //   const finalWhereClause = whereClause ? `WHERE ${whereClause}` : '';
  //
  //   return this._getResult(finalWhereClause, pagination, params);
  // }

  async findById(id: number): Promise<any> {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .select([
        'u.id::text AS id',
        'u.login as login',
        'u.email as email',
        'u.createdAt as "createdAt"',
      ])
      .where('u.id = :id', { id: id })
      .getRawOne();

    console.log(result);

    return result;
    // const result: User | null = await this.usersRepository.findOneBy({ id });
    // console.log(result);
    // return result ? UserOutputModelMapper(result) : null;
  }

  // TODO: not sure about name
  async findAuthenticatedUserById(id: string): Promise<any> {
    // const query: string = `SELECT * FROM public."user" WHERE id=$1`;
    //
    // const result = await this.dataSource.query(query, [id]);
    //
    // return result.length > 0 ? AuthenticatedUserModelMapper(result[0]) : null;

    const result = await this.usersRepository
      .createQueryBuilder('u')
      .select([
        'CAST(u.id as text) AS "userId"',
        'u.login as login',
        'u.email as email',
      ])
      .where('u.id = :id', { id: id })
      .getRawOne();

    console.log(result);

    return result;
  }

  // // TODO: change type any
  // private async _getResult(
  //   filter: any,
  //   pagination: PaginationWithSearchLoginAndEmailTerm<PaginationWithSearchLoginAndEmailTermQuery>,
  //   params: string[],
  // ) {
  //   const query: string = `
  //     SELECT * FROM public."user"
  //     ${filter ? filter : ''}
  //     ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}
  //     OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
  //     LIMIT ${pagination.pageSize}
  //   `;
  //
  //   const result = await this.dataSource.query(query, params);
  //
  //   // count documents with filter
  //   const countQuery: string = `
  //     SELECT COUNT(*) as count FROM public."user"
  //     ${filter ? filter : ''}
  //   `;
  //
  //   const countResult = await this.dataSource.query(countQuery, params);
  //
  //   const totalCount: number = Number(countResult[0].count);
  //
  //   const mappedUsers: any[] = result.map(UserOutputModelMapper);
  //
  //   return new PaginationOutput<UserOutputModel>(
  //     mappedUsers,
  //     pagination.pageNumber,
  //     pagination.pageSize,
  //     totalCount,
  //   );
  // }
}
