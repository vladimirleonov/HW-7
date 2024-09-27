import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../../core/guards/passport/basic-auth.guard';
import { BlogsPostgresQueryRepository } from '../infrastructure/postgres/blogs-postgres.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { PaginationWithSearchNameTerm } from '../../../../base/models/pagination.base.model';
import { BlogCreateModel } from './models/input/create-blog.input.model';
import { Result } from '../../../../base/types/object-result';
import { CreateBlogCommand } from '../application/use-cases/create-blog.usecase';
import { BlogOutputModel } from './models/output/blog.output.model';
import { InternalServerErrorException } from '../../../../core/exception-filters/http-exception-filter';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';

const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> = [
  'name',
];

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class BlogsSAController {
  constructor(
    private readonly blogsPostgresQueryRepository: BlogsPostgresQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAll(@Query() query: any) {
    const pagination: PaginationWithSearchNameTerm =
      new PaginationWithSearchNameTerm(query, BLOGS_SORTING_PROPERTIES);

    const blogs = await this.blogsPostgresQueryRepository.getAll(pagination);

    return blogs;
  }

  @Post()
  async create(@Body() createModel: BlogCreateModel) {
    const { name, description, websiteUrl } = createModel;

    const result: Result<number> = await this.commandBus.execute(
      new CreateBlogCommand(name, description, websiteUrl),
    );

    const createdId: number = result.data;

    const createdBlog: BlogOutputModel | null =
      await this.blogsPostgresQueryRepository.findById(createdId);

    if (!createdBlog) {
      throw new InternalServerErrorException();
    }

    return createdBlog;
  }
}
