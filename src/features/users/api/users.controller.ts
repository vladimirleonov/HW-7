import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UserOutputModel } from './models/output/get-users.output.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { PaginationWithSearchLoginAndEmailTerm } from '../../../../base/models/pagination.base.model';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { UserCreateModel } from './models/input/create-user.input.model';
import { Result } from '../../../../base/types/object-result';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: any) {
    const pagination: PaginationWithSearchLoginAndEmailTerm =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES,
      );

    const users: any = await this.usersQueryRepository.getAll(pagination);

    return users;
  }

  @Post()
  async create(@Body() createModel: UserCreateModel) {
    const { login, password, email } = createModel;

    const result: Result<string | null> = await this.usersService.create(login, password, email)

    const createdUserId: string = result.data
    console.log(createdUserId);

    const createdUser: UserOutputModel | null = await this.usersQueryRepository.findById(createdUserId)

    return createdUser;
  }
}
