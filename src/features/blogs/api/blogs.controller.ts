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
  Put,
  Query,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import {
  PaginationOutput,
  PaginationWithSearchNameTerm,
} from '../../../../base/models/pagination.base.model';
import { BlogOutputModel } from './models/output/blog.output.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { BlogCreateModel } from './models/input/create-blog.input.model';
import { BlogUpdateModel } from './models/input/update-blog.input.model';

const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> = [
  'name',
];

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  // TODO: change type any
  async getAll(@Query() query: any) {
    const pagination: PaginationWithSearchNameTerm =
      new PaginationWithSearchNameTerm(query, BLOGS_SORTING_PROPERTIES);

    const users: PaginationOutput<BlogOutputModel> =
      await this.blogsQueryRepository.getAll(pagination);

    return users;
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const blog: BlogOutputModel | null =
      await this.blogsQueryRepository.findById(id);

    if (!blog) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Blog with id ${id} not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return blog;
  }

  @Post()
  async create(@Body() createModel: BlogCreateModel) {
    const { name, description, websiteUrl } = createModel;

    const result: Result<string> = await this.blogsService.create(
      name,
      description,
      websiteUrl,
    );

    const createdId: string = result.data;

    const createdBlog: BlogOutputModel | null =
      await this.blogsQueryRepository.findById(createdId);

    if (!createdBlog) {
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

    return createdBlog;
  }

  @Put(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updateModel: BlogUpdateModel) {
    const { name, description, websiteUrl } = updateModel;

    const result: Result<boolean> = await this.blogsService.update(
      id,
      name,
      description,
      websiteUrl,
    );

    if (result.status === ResultStatus.NotFound) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: result.extensions[0].message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    const result: Result<boolean> = await this.blogsService.delete(id);

    if (result.status === ResultStatus.NotFound) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: result.extensions[0].message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
