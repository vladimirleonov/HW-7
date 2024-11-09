import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersTypeormQueryRepository } from '../../../../users/infrastructure/typeorm/users-typeorm.query-repository';
import { User } from '../../../../users/domain/user.entity';

export class GetAuthMeQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetAuthMeQuery)
export class GetAuthMeUseCase implements IQueryHandler<GetAuthMeQuery> {
  constructor(
    private readonly usersTypeormQueryRepository: UsersTypeormQueryRepository,
  ) {}

  execute(query: GetAuthMeQuery): Promise<User> {
    const { userId } = query;
    return this.usersTypeormQueryRepository.findAuthenticatedUserById(userId);
  }
}
