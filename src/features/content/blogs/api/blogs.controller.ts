import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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
import { BlogCreateModel } from './models/input/create-blog.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { OptionalUserId } from '../../../../core/decorators/param/current-user-optional-user-id.param.decorator';
import { BasicAuthGuard } from '../../../../core/guards/passport/basic-auth.guard';
import { OptionalJwtAuthGuard } from '../../../../core/guards/passport/optional-jwt-auth-guard';
import { BlogsPostgresQueryRepository } from '../infrastructure/postgres/blogs-postgres.query-repository';
import { PostsPostgresQueryRepository } from '../../posts/infrastructure/postgres/posts-postgres.query-repository';
import {
  InternalServerErrorException,
  NotFoundException,
} from '../../../../core/exception-filters/http-exception-filter';
import { POSTS_SORTING_PROPERTIES } from '../../posts/api/posts.controller';
import { PostOutputModel } from '../../posts/api/models/output/post.output.model';
import { Result } from '../../../../base/types/object-result';
import { CreateBlogCommand } from '../application/use-cases/create-blog.usecase';

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
  // TODO: change type any
  async getAll(@Query() query: any) {
    const pagination: PaginationWithSearchNameTerm =
      new PaginationWithSearchNameTerm(query, BLOGS_SORTING_PROPERTIES);

    const blogs: PaginationOutput<BlogOutputModel> =
      await this.blogsPostgresQueryRepository.getAll(pagination);

    return blogs;
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

  // TODO: change any type
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

    const pagination: Pagination = new Pagination(
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

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() createModel: BlogCreateModel) {
    const { name, description, websiteUrl } = createModel;

    const result: Result<number> = await this.commandBus.execute<
      CreateBlogCommand,
      Result<number>
    >(new CreateBlogCommand(name, description, websiteUrl));

    const createdId: number = result.data;

    const createdBlog: BlogOutputModel | null =
      await this.blogsPostgresQueryRepository.findById(createdId);

    if (!createdBlog) {
      // error if just created blog not found
      throw new InternalServerErrorException();
    }

    return createdBlog;
  }

  // @Post(':blogId/posts')
  // @UseGuards(BasicAuthGuard)
  // async createPostForBlog(
  //   @Param('blogId', new ParseIntPipe()) blogId: number,
  //   @Body() createModel: PostForBlogCreateModel,
  // ) {
  //   const { title, shortDescription, content } = createModel;
  //
  //   const result: Result<string | null> = await this.commandBus.execute<
  //     CreatePostCommand,
  //     Result<string | null>
  //   >(new CreatePostCommand(title, shortDescription, content, blogId));
  //
  //   if (result.status === ResultStatus.NotFound) {
  //     throw new NotFoundException(result.errorMessage!);
  //   }
  //
  //   const createdId: string = result.data!;
  //
  //   const post: PostOutputModel | null =
  //     await this.postQueryRepository.findById(createdId);
  //
  //   if (!post) {
  //     throw new InternalServerErrorException();
  //   }
  //
  //   return post;
  // }

  // @Put(':id')
  // @UseGuards(BasicAuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async update(
  //   @Param('id', new ParseIntPipe()) id: number,
  //   @Body() updateModel: BlogUpdateModel,
  // ) {
  //   const { name, description, websiteUrl } = updateModel;
  //
  //   const result: Result = await this.commandBus.execute<
  //     UpdateBlogCommand,
  //     Result
  //   >(new UpdateBlogCommand(id, name, description, websiteUrl));
  //
  //   if (result.status === ResultStatus.NotFound) {
  //     throw new NotFoundException(result.errorMessage!);
  //   }
  // }

  // @Delete(':id')
  // @UseGuards(BasicAuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async delete(@Param('id', new ParseIntPipe()) id: number) {
  //   const result: Result = await this.commandBus.execute<
  //     DeleteBlogCommand,
  //     Result
  //   >(new DeleteBlogCommand(id));
  //
  //   if (result.status === ResultStatus.NotFound) {
  //     throw new NotFoundException(result.errorMessage!);
  //   }
  // }
}
