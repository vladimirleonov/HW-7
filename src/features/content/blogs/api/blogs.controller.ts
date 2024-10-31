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
import { QueryBus } from '@nestjs/cqrs';
import { OptionalUserId } from '../../../../core/decorators/param-decorators/current-user-optional-user-id.param.decorator';
import { OptionalJwtAuthGuard } from '../../../../core/guards/passport/optional-jwt-auth-guard';
import { BlogsTypeormQueryRepository } from '../infrastructure/typeorm/blogs-typeorm.query-repository';
import { NotFoundException } from '../../../../core/exception-filters/http-exception-filter';
import { POSTS_SORTING_PROPERTIES } from '../../posts/api/posts.controller';
import { PaginationQuery } from '../../../../base/models/pagination-query.input.model';
import { BlogsPaginationQuery } from './models/input/blogs-pagination-query.input.model';
import { Blog } from '../domain/blog.entity';
import { Post } from '../../posts/domain/post.entity';
import { GetAllBlogsQuery } from './queries/get-all-blogs.query';
import { GetAllBlogPostsQuery } from '../../posts/api/queries/get-all-blog-posts.query';
import { GetBlogQuery } from './queries/get-blog.query';
import { PostsPaginationQuery } from '../../posts/api/models/input/posts-pagination-query.input.model';

const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> = [
  'name',
];

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly blogsTypeormQueryRepository: BlogsTypeormQueryRepository,
  ) {}

  @Get()
  async getAll(
    @Query() query: BlogsPaginationQuery,
  ): Promise<PaginationOutput<Blog>> {
    const pagination: PaginationWithSearchNameTerm<BlogsPaginationQuery> =
      new PaginationWithSearchNameTerm(query, BLOGS_SORTING_PROPERTIES);

    const result: PaginationOutput<Blog> = await this.queryBus.execute<
      GetAllBlogsQuery,
      PaginationOutput<Blog>
    >(new GetAllBlogsQuery(pagination));

    return result;
  }

  @Get(':blogId/posts')
  @UseGuards(OptionalJwtAuthGuard)
  async getAllBlogPosts(
    @Query() query: PostsPaginationQuery,
    @OptionalUserId() userId: number,
    @Param('blogId', new ParseIntPipe()) blogId: number,
  ) {
    // TODO: is it ok to get from blogsPostgresQueryRepository check
    // or do it in getAllBlogPosts
    const blog: BlogOutputModel | null =
      await this.blogsTypeormQueryRepository.findById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }

    const pagination: Pagination<PaginationQuery> = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES,
    );

    // const blogPosts: PaginationOutput<Post> =
    //   await this.postsTypeormQueryRepository.getAllBlogPosts(
    //     pagination,
    //     blogId,
    //     userId,
    //   );

    const blogPosts: PaginationOutput<Post> = await this.queryBus.execute<
      GetAllBlogPostsQuery,
      PaginationOutput<Post>
    >(new GetAllBlogPostsQuery(pagination, blogId, userId));

    return blogPosts;
  }

  @Get(':id')
  async getOne(@Param('id', new ParseIntPipe()) id: number) {
    // const blog: BlogOutputModel | null =
    //   await this.blogsTypeormQueryRepository.findById(id);

    const blog: Blog | null = await this.queryBus.execute<
      GetBlogQuery,
      Blog | null
    >(new GetBlogQuery(id));

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return blog;
  }
}
