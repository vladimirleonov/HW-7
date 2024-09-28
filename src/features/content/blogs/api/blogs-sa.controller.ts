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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../../core/guards/passport/basic-auth.guard';
import { BlogsPostgresQueryRepository } from '../infrastructure/postgres/blogs-postgres.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import {
  Pagination,
  PaginationOutput,
  PaginationWithSearchNameTerm,
} from '../../../../base/models/pagination.base.model';
import { BlogCreateModel } from './models/input/create-blog.input.model';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { CreateBlogCommand } from '../application/use-cases/create-blog.usecase';
import { BlogOutputModel } from './models/output/blog.output.model';
import {
  InternalServerErrorException,
  NotFoundException,
} from '../../../../core/exception-filters/http-exception-filter';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { BlogUpdateModel } from './models/input/update-blog.input.model';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.usecase';
import { PostForBlogCreateModel } from './models/input/create-post-for-blog.input.model';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.usecase';
import { PostsPostgresQueryRepository } from '../../posts/infrastructure/postgres/posts-postgres.query-repository';
import { OptionalJwtAuthGuard } from '../../../../core/guards/passport/optional-jwt-auth-guard';
import { OptionalUserId } from '../../../../core/decorators/param/current-user-optional-user-id.param.decorator';
import { POSTS_SORTING_PROPERTIES } from '../../posts/api/posts.controller';
import { PostOutputModel } from '../../posts/api/models/output/post.output.model';

const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> = [
  'name',
];

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class BlogsSAController {
  constructor(
    private readonly blogsPostgresQueryRepository: BlogsPostgresQueryRepository,
    private readonly postsPostgresQueryRepository: PostsPostgresQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAll(@Query() query: any) {
    const pagination: PaginationWithSearchNameTerm =
      new PaginationWithSearchNameTerm(query, BLOGS_SORTING_PROPERTIES);

    const blogs = await this.blogsPostgresQueryRepository.getAll(pagination);
    console.log(blogs);
    return blogs;
  }

  @Post()
  async create(@Body() createModel: BlogCreateModel) {
    const { name, description, websiteUrl } = createModel;

    const result: Result<number> = await this.commandBus.execute(
      new CreateBlogCommand(name, description, websiteUrl),
    );

    const createdId: number = result.data;
    console.log('createdId', createdId);

    const createdBlog: BlogOutputModel | null =
      await this.blogsPostgresQueryRepository.findById(createdId);

    if (!createdBlog) {
      throw new InternalServerErrorException();
    }

    return createdBlog;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateModel: BlogUpdateModel,
  ) {
    const { name, description, websiteUrl } = updateModel;

    const result = await this.commandBus.execute<
      UpdateBlogCommand,
      Result<any>
    >(new UpdateBlogCommand(id, name, description, websiteUrl));

    console.log(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseIntPipe()) id: number) {
    const result = await this.commandBus.execute<
      DeleteBlogCommand,
      Result<any>
    >(new DeleteBlogCommand(id));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    }
  }

  @Get(':blogId/posts')
  @UseGuards(OptionalJwtAuthGuard)
  async getAllBlogPosts(
    @Query() query: any,
    @OptionalUserId() userId: number,
    @Param('blogId', new ParseIntPipe()) blogId: number,
  ) {
    console.log('OK!!!');
    // TODO: ask if is it ok?
    const blog: BlogOutputModel | null =
      await this.blogsPostgresQueryRepository.findById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }

    const pagination: Pagination = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES,
    );

    const blogPosts: PaginationOutput<PostOutputModel> =
      await this.postsPostgresQueryRepository.getAllBlogPosts(
        pagination,
        blogId,
      );

    return blogPosts;
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('blogId', new ParseIntPipe()) blogId: number,
    @Body() createModel: PostForBlogCreateModel,
  ) {
    console.log('in createPostForBlog');
    const { title, shortDescription, content } = createModel;

    const result: Result<number> = await this.commandBus.execute<
      CreatePostCommand,
      Result<number>
    >(new CreatePostCommand(title, shortDescription, content, blogId));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage!);
    }

    const createdId: number = result.data;

    const post = await this.postsPostgresQueryRepository.findById(createdId);

    if (!post) {
      throw new InternalServerErrorException();
    }

    return post;
  }
}
