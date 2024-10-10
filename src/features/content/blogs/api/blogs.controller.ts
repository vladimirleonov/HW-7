import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  Pagination,
  PaginationOutput,
  PaginationWithSearchNameTerm,
} from '../../../../base/models/pagination.base.model';
import { BlogOutputModel } from './models/output/blog.output.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { CommandBus } from '@nestjs/cqrs';
import { OptionalUserId } from '../../../../core/decorators/param-decorators/current-user-optional-user-id.param.decorator';
import { OptionalJwtAuthGuard } from '../../../../core/guards/passport/optional-jwt-auth-guard';
import { BlogsPostgresQueryRepository } from '../infrastructure/postgres/blogs-postgres.query-repository';
import { PostsPostgresQueryRepository } from '../../posts/infrastructure/postgres/posts-postgres.query-repository';
import { NotFoundException } from '../../../../core/exception-filters/http-exception-filter';
import { POSTS_SORTING_PROPERTIES } from '../../posts/api/posts.controller';
import { PostOutputModel } from '../../posts/api/models/output/post.output.model';
import { PaginationQuery } from '../../../../base/models/pagination-query.input.model';
import { BlogsPaginationQuery } from './models/input/blogs-pagination-query.input.model';

const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> = [
  'name',
];

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsPostgresQueryRepository: BlogsPostgresQueryRepository,
    private readonly postsPostgresQueryRepository: PostsPostgresQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: BlogsPaginationQuery) {
    const pagination: PaginationWithSearchNameTerm<BlogsPaginationQuery> =
      new PaginationWithSearchNameTerm(query, BLOGS_SORTING_PROPERTIES);

    const blogs: PaginationOutput<BlogOutputModel> =
      await this.blogsPostgresQueryRepository.getAll(pagination);

    return blogs;
  }

  @Get(':blogId/posts')
  @UseGuards(OptionalJwtAuthGuard)
  async getAllBlogPosts(
    @Query() query: any,
    @OptionalUserId() userId: number,
    @Param('blogId', new ParseIntPipe()) blogId: number,
  ) {
    // TODO: ask if is it ok?
    const blog: BlogOutputModel | null =
      await this.blogsPostgresQueryRepository.findById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }

    const pagination: Pagination<PaginationQuery> = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES,
    );

    const blogPosts: PaginationOutput<PostOutputModel> =
      await this.postsPostgresQueryRepository.getAllBlogPosts(
        pagination,
        blogId,
        userId,
      );

    return blogPosts;
  }

  @Get(':id')
  async getOne(@Param('id', new ParseIntPipe()) id: number) {
    const blog: BlogOutputModel | null =
      await this.blogsPostgresQueryRepository.findById(id);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return blog;
  }
}
