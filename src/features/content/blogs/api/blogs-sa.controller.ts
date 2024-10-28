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
import { BlogsTypeormQueryRepository } from '../infrastructure/typeorm/blogs-typeorm.query-repository';
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
import { PostForBlogCreateModel } from '../../posts/api/models/input/create-post-for-blog.input.model';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.usecase';
import { PostsTypeormQueryRepository } from '../../posts/infrastructure/typeorm/posts-typeorm.query-repository';
import { POSTS_SORTING_PROPERTIES } from '../../posts/api/posts.controller';
import { BlogPostUpdateModel } from './models/input/update-blog-post.model';
import { UpdateBlogPostCommand } from '../../posts/application/use-cases/update-blog-post.usecase';
import { DeleteBlogPostCommand } from '../../posts/application/use-cases/delete-blog-post.usecase';
import {
  PaginationQuery,
  PaginationWithSearchNameTermQuery,
} from '../../../../base/models/pagination-query.input.model';
import { Blog } from '../domain/blog.entity';
import { Post as PostEntity } from '../../posts/domain/post.entity';
import { GetAllBlogPostsQuery } from '../../posts/infrastructure/quueries/get-all-blog-posts.query';
import { GetAllBlogsQuery } from '../infrastructure/queries/get-all-blogs.query';

const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> = [
  'name',
];

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class BlogsSAController {
  constructor(
    private readonly blogsTypeormQueryRepository: BlogsTypeormQueryRepository,
    private readonly postsTypeormQueryRepository: PostsTypeormQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: CommandBus,
  ) {}

  @Get()
  async getAll(@Query() query: any) {
    const pagination: PaginationWithSearchNameTerm<PaginationWithSearchNameTermQuery> =
      new PaginationWithSearchNameTerm(query, BLOGS_SORTING_PROPERTIES);

    // const blogs = await this.blogsTypeormQueryRepository.getAll(pagination);

    const blogs: PaginationOutput<Blog> = await this.queryBus.execute<
      GetAllBlogsQuery,
      PaginationOutput<Blog>
    >(new GetAllBlogsQuery(pagination));

    return blogs;
  }

  @Post()
  async create(@Body() createModel: BlogCreateModel) {
    const { name, description, websiteUrl } = createModel;

    const result: Result<number> = await this.commandBus.execute(
      new CreateBlogCommand(name, description, websiteUrl),
    );

    const createdId: number = result.data;

    const createdBlog: Blog | null =
      await this.blogsTypeormQueryRepository.findById(createdId);

    // if (!createdBlog) {
    //   throw new InternalServerErrorException();
    // }

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

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage);
    }
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
  async getAllBlogPosts(
    @Query() query: any,
    @Param('blogId', new ParseIntPipe()) blogId: number,
  ) {
    // TODO: ask if is it ok to check blog is exists in controller here
    // or do it in.getAllBlogPosts
    const blog: Blog | null =
      await this.blogsTypeormQueryRepository.findById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }

    const pagination: Pagination<PaginationQuery> = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES,
    );

    // const blogPosts: PaginationOutput<PostEntity> =
    //   await this.postsTypeormQueryRepository.getAllBlogPosts(
    //     pagination,
    //     blogId,
    //   );

    const blogPosts: PaginationOutput<PostEntity> = await this.queryBus.execute<
      GetAllBlogPostsQuery,
      PaginationOutput<PostEntity>
    >(new GetAllBlogPostsQuery(pagination, blogId));

    return blogPosts;
  }

  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId', new ParseIntPipe()) blogId: number,
    @Body() createModel: PostForBlogCreateModel,
  ) {
    const { title, shortDescription, content } = createModel;

    const result: Result<number> = await this.commandBus.execute<
      CreatePostCommand,
      Result<number>
    >(new CreatePostCommand(title, shortDescription, content, blogId));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage!);
    }

    const createdId: number = result.data;

    const post = await this.postsTypeormQueryRepository.getOne(createdId);

    if (!post) {
      throw new InternalServerErrorException();
    }

    return post;
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogPost(
    @Param('blogId', new ParseIntPipe()) blogId: number,
    @Param('postId', new ParseIntPipe()) postId: number,
    @Body() blogPostUpdateModel: BlogPostUpdateModel,
  ) {
    const { title, shortDescription, content } = blogPostUpdateModel;

    const result = await this.commandBus.execute<
      UpdateBlogPostCommand,
      Result<any>
    >(
      new UpdateBlogPostCommand(
        title,
        shortDescription,
        content,
        blogId,
        postId,
      ),
    );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage);
    }
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogPost(
    @Param('blogId', new ParseIntPipe()) blogId: number,
    @Param('postId', new ParseIntPipe()) postId: number,
  ) {
    const result = await this.commandBus.execute<
      DeleteBlogPostCommand,
      Result<any>
    >(new DeleteBlogPostCommand(blogId, postId));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage);
    }
  }
}
