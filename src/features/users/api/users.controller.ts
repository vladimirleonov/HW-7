import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UserOutputModel } from './models/output/user.output.model';
import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../base/models/pagination.base.model';
import { UserCreateModel } from './models/input/create-user.input.model';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UsersTypeormQueryRepository } from '../infrastructure/typeorm/users-typeorm.query-repository';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { CreateUserCommand } from '../application/use-cases/create-user.usecase';
import {
  BadRequestException,
  NotFoundException,
} from '../../../core/exception-filters/http-exception-filter';
import { DeleteUserCommand } from '../application/use-cases/delete-user.usecase';
import { BasicAuthGuard } from '../../../core/guards/passport/basic-auth.guard';
import { UsersPaginationQuery } from './models/input/users-pagination-query.input.model';
import { User } from '../domain/user.entity';
import { GetAllUsersQuery } from './queries/get-all-users.query';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly usersTypeormQueryRepository: UsersTypeormQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: UsersPaginationQuery) {
    const pagination: PaginationWithSearchLoginAndEmailTerm<UsersPaginationQuery> =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES,
      );

    const result: PaginationOutput<User> = await this.queryBus.execute<
      GetAllUsersQuery,
      PaginationOutput<User>
    >(new GetAllUsersQuery(pagination));

    return result;
  }

  @Post()
  async create(@Body() createModel: UserCreateModel) {
    const { login, password, email } = createModel;

    const result: Result<number | null> = await this.commandBus.execute<
      CreateUserCommand,
      Result<number | null>
    >(new CreateUserCommand(login, password, email));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions!);
    }

    const createdUserId: number = result.data!;

    const createdUser: User =
      await this.usersTypeormQueryRepository.findById(createdUserId);

    return createdUser;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseIntPipe()) id: number) {
    const result: Result = await this.commandBus.execute<
      DeleteUserCommand,
      Result
    >(new DeleteUserCommand(id));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage!);
    }

    return;
  }
}
