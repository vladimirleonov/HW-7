import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { ParseMongoIdPipe } from '../../../core/pipes/parse-mongo-id.pipe';
import { BasicAuthGuard } from '../../../core/guards/passport/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UsersPostgresqlQueryRepository } from '../infrastructure/postgresql/users-postgresql.query-repository';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { CreateUserCommand } from '../application/use-cases/create-user.usecase';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '../../../core/exception-filters/http-exception-filter';
import { DeleteUserCommand } from '../application/use-cases/delete-user.usecase';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@Controller('users')
// @UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersPostgresqlQueryRepository: UsersPostgresqlQueryRepository,
  ) {}

  @Get()
  // TODO: change type any
  async getAll(@Query() query: any) {
    const pagination: PaginationWithSearchLoginAndEmailTerm =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES,
      );

    // const users: PaginationOutput<any> =
    //   await this.usersPostgresqlQueryRepository.getAll(pagination);
    //
    // return users;
  }

  @Post()
  async create(@Body() createModel: UserCreateModel) {
    const { login, password, email } = createModel;

    const result: Result<string | null> = await this.commandBus.execute<
      CreateUserCommand,
      Result<string | null>
    >(new CreateUserCommand(login, password, email));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.errorMessage!);
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
  @HttpCode(204)
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
