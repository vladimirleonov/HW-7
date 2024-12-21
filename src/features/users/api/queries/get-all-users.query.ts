import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../../base/models/pagination.base.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersTypeormQueryRepository } from '../../infrastructure/typeorm/users-typeorm.query-repository';
import { User } from '../../domain/user.entity';
import { SearchLoginAndEmailQueryParams } from '../../../../base/models/pagination-query.input.model';

export class GetAllUsersQuery {
  constructor(
    public readonly pagination: PaginationWithSearchLoginAndEmailTerm<SearchLoginAndEmailQueryParams>,
  ) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersUseCase implements IQueryHandler<GetAllUsersQuery> {
  constructor(
    private readonly usersTypeormQueryRepository: UsersTypeormQueryRepository,
  ) {}

  execute(query: GetAllUsersQuery): Promise<PaginationOutput<User>> {
    const { pagination } = query;

    return this.usersTypeormQueryRepository.getAll(pagination);
  }
}
