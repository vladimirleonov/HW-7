import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import {
  PaginationOutput,
  PaginationWithSearchNameTerm,
} from '../../../../base/models/pagination.base.model';
import { BlogsOutputModel } from './models/output/blogs.output.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { Result } from '../../../../base/types/object-result';
import { BlogCreateModel } from './models/input/create-blog.input.model';

const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogsOutputModel> = [
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

    const users: PaginationOutput<BlogsOutputModel> =
      await this.blogsQueryRepository.getAll(pagination);

    return users;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const blog: BlogsOutputModel | null =
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
  async createBlog(@Body() createModel: BlogCreateModel) {
    const { name, description, websiteUrl } = createModel;

    const result: Result<string> = await this.blogsService.create(
      name,
      description,
      websiteUrl,
    );

    const createdId: string = result.data;

    const createdBlog: BlogsOutputModel | null =
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
}
