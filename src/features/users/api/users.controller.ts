import { Controller, Get, Query } from '@nestjs/common';
// import { UsersService } from '../application/users.service';
import { UserOutputModel } from './models/output/get-users.output.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { PaginationWithSearchLoginAndEmailTerm } from '../../../../base/models/pagination.base.model';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@Controller('users')
export class UsersController {
  constructor(
    // private readonly usersService: UsersService,
    private readonly UsersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: any) {
    const pagination: PaginationWithSearchLoginAndEmailTerm =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES,
      );

    const users: any = await this.UsersQueryRepository.getAll(pagination);

    return users;
  }
}
