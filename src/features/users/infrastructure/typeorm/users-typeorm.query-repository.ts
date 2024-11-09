import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
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
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async getAll(
    pagination: PaginationWithSearchLoginAndEmailTerm<UsersPaginationQuery>,
  ): Promise<PaginationOutput<User>> {
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

    const users: User[] = await query.getRawMany();

    const totalCount: number = await query.getCount();

    return new PaginationOutput<User>(
      users,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  async findById(id: number): Promise<User> {
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

    return result;
  }

  async findAuthenticatedUserById(id: number): Promise<User> {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .select([
        'CAST(u.id as text) AS "userId"',
        'u.login as login',
        'u.email as email',
      ])
      .where('u.id = :id', { id: id })
      .getRawOne();

    return result;
  }
}
