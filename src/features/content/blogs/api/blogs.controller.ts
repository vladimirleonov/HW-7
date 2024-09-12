import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import {
  Pagination,
  PaginationOutput,
  PaginationWithSearchNameTerm,
} from '../../../../base/models/pagination.base.model';
import { BlogOutputModel } from './models/output/blog.output.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { BlogCreateModel } from './models/input/create-blog.input.model';
import { BlogUpdateModel } from './models/input/update-blog.input.model';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { PostOutputModel } from '../../posts/api/models/output/post.output.model';
import { PostForBlogCreateModel } from './models/input/create-post-for-blog.input.model';
import { PostsService } from '../../posts/application/posts.service';
import { POSTS_SORTING_PROPERTIES } from '../../posts/api/posts.controller';
import { ParseMongoIdPipe } from '../../../../core/pipes/parse-mongo-id.pipe';
import {
  InternalServerErrorException,
  NotFoundException,
} from '../../../../core/exception-filters/http-exception-filter';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.usecase';
import { CreateBlogCommand } from '../application/use-cases/create-blog.usecase';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.usecase';
import { OptionalUserId } from '../../../../core/decorators/param/current-user-optional-user-id.param.decorator';
import { BasicAuthGuard } from '../../../../core/guards/passport/basic-auth.guard';
import { OptionalJwtAuthGuard } from '../../../../core/guards/passport/optional-jwt-auth-guard';

const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> = [
  'name',
  'createdAt',
];

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    // private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    // private readonly postService: PostsService,
    private readonly postQueryRepository: PostsQueryRepository,
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
  async getOne(@Param('id', new ParseMongoIdPipe()) id: string) {
    const blog: BlogOutputModel | null =
      await this.blogsQueryRepository.findById(id);

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
    @OptionalUserId() userId: string,
    @Param('blogId', new ParseMongoIdPipe()) blogId: string,
  ) {
    // TODO: ask if is it ok?
    const blog: BlogOutputModel | null =
      await this.blogsQueryRepository.findById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }

    const pagination: Pagination = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES,
    );

    const blogPosts: PaginationOutput<PostOutputModel> =
      await this.postQueryRepository.getAllBlogPosts(
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

    const result: Result<string> = await this.commandBus.execute<
      CreateBlogCommand,
      Result<string>
    >(new CreateBlogCommand(name, description, websiteUrl));

    // const result: Result<string> = await this.blogsService.create(
    //   name,
    //   description,
    //   websiteUrl,
    // );

    const createdId: string = result.data;

    const createdBlog: BlogOutputModel | null =
      await this.blogsQueryRepository.findById(createdId);

    if (!createdBlog) {
      // error if just created blog not found
      throw new InternalServerErrorException();
    }

    return createdBlog;
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('blogId', new ParseMongoIdPipe()) blogId: string,
    @Body() createModel: PostForBlogCreateModel,
  ) {
    const { title, shortDescription, content } = createModel;

    const result: Result<string | null> = await this.commandBus.execute<
      CreatePostCommand,
      Result<string | null>
    >(new CreatePostCommand(title, shortDescription, content, blogId));

    // const result: Result<string | null> = await this.postService.create(
    //   title,
    //   shortDescription,
    //   content,
    //   blogId,
    // );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage!);
    }

    const createdId: string = result.data!;

    const post: PostOutputModel | null =
      await this.postQueryRepository.findById(createdId);

    if (!post) {
      throw new InternalServerErrorException();
    }

    return post;
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async update(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() updateModel: BlogUpdateModel,
  ) {
    const { name, description, websiteUrl } = updateModel;

    const result: Result = await this.commandBus.execute<
      UpdateBlogCommand,
      Result
    >(new UpdateBlogCommand(id, name, description, websiteUrl));

    // const result: Result = await this.blogsService.update(
    //   id,
    //   name,
    //   description,
    //   websiteUrl,
    // );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage!);
    }
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async delete(@Param('id', new ParseMongoIdPipe()) id: string) {
    const result: Result = await this.commandBus.execute<
      DeleteBlogCommand,
      Result
    >(new DeleteBlogCommand(id));
    // const result: Result = await this.blogsService.delete(id);

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage!);
    }
  }
}
