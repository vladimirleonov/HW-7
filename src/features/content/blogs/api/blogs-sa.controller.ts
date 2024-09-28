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
import { PaginationWithSearchNameTerm } from '../../../../base/models/pagination.base.model';
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
