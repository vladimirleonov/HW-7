import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UserOutputModel } from './models/output/user.output.model';
import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../base/models/pagination.base.model';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { UserCreateModel } from './models/input/create-user.input.model';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { ParseMongoIdPipe } from '../../../infrastructure/decorators/pipes/parse-mongo-id.pipe';
import { BasicAuthGuard } from '../../../infrastructure/guards/basic-auth.guard';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  // TODO: change type any
  async getAll(@Query() query: any) {
    const pagination: PaginationWithSearchLoginAndEmailTerm =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES,
      );

    const users: PaginationOutput<UserOutputModel> =
      await this.usersQueryRepository.getAll(pagination);

    return users;
  }

  @Post()
  async create(@Body() createModel: UserCreateModel) {
    const { login, password, email } = createModel;

    const result: Result<string | null> = await this.usersService.create(
      login,
      password,
      email,
    );

    if (result.status === ResultStatus.BadRequest) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: result.extensions![0].message,
          // error: result.status,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdUserId: string = result.data!;

    const createdUser: UserOutputModel | null =
      await this.usersQueryRepository.findById(createdUserId);

    if (!createdUser) {
      // error if just created blog not found
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
          // error: result.status,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return createdUser;
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new ParseMongoIdPipe()) id: string) {
    const result: Result<boolean> = await this.usersService.delete(id);

    if (result.status === ResultStatus.NotFound) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: result.extensions![0].message,
          error: result.status,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return;
  }
}
