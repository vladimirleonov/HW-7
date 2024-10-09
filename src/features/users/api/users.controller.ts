import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CommandBus } from '@nestjs/cqrs';
import { UsersPostgresQueryRepository } from '../infrastructure/postgresql/users-postgres.query-repository';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { CreateUserCommand } from '../application/use-cases/create-user.usecase';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '../../../core/exception-filters/http-exception-filter';
import { DeleteUserCommand } from '../application/use-cases/delete-user.usecase';
import { BasicAuthGuard } from '../../../core/guards/passport/basic-auth.guard';
import { PaginationWithSearchLoginAndEmailTermQuery } from '../../../base/models/pagination-query.input.model';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersPostgresqlQueryRepository: UsersPostgresQueryRepository,
  ) {}

  @Get()
  // TODO: change type any
  async getAll(@Query() query: PaginationWithSearchLoginAndEmailTermQuery) {
    console.log(query);

    const pagination: PaginationWithSearchLoginAndEmailTerm<PaginationWithSearchLoginAndEmailTermQuery> =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES,
      );

    const users: PaginationOutput<any> =
      await this.usersPostgresqlQueryRepository.getAll(pagination);

    return users;
  }

  @Post()
  async create(@Body() createModel: UserCreateModel) {
    const { login, password, email } = createModel;

    const result: Result<string | null> = await this.commandBus.execute<
      CreateUserCommand,
      Result<string | null>
    >(new CreateUserCommand(login, password, email));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions!);
    }

    const createdUserId: string = result.data!;

    const createdUser =
      await this.usersPostgresqlQueryRepository.findById(createdUserId);

    if (!createdUser) {
      // error if just created blog not found
      throw new InternalServerErrorException(result.errorMessage!);
    }

    return createdUser;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
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
