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

const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> = [
  'name',
  'createdAt',
];

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postService: PostsService,
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

  // TODO: change any type
  @Get(':blogId/posts')
  async getAllBlogPosts(@Query() query: any, @Param('blogId') blogId: string) {
    // let userId = null
    // if (req.headers.authorization) {
    //   const result: Result<JwtPayload | null> = await this.authService.checkAccessToken(req.headers.authorization)
    //   if (result.status === ResultStatus.Success) {
    //     userId = result.data!.userId
    //   }
    // }

    // TODO: ask if is it ok?
    const blog: BlogOutputModel | null =
      await this.blogsQueryRepository.findById(blogId);
    if (!blog) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Blog with id ${blogId} not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const pagination: Pagination = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES,
    );

    const blogPosts: PaginationOutput<PostOutputModel> =
      await this.postQueryRepository.getAllBlogPosts(pagination, blogId);

    return blogPosts;
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

  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() createModel: PostForBlogCreateModel,
  ) {
    const { title, shortDescription, content } = createModel;

    const result: Result<string | null> = await this.postService.create(
      title,
      shortDescription,
      content,
      blogId,
    );

    if (result.status === ResultStatus.NotFound) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: result.extensions![0].message,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const createdId: string = result.data!;

    const post: PostOutputModel | null =
      await this.postQueryRepository.findById(createdId);
    if (!post) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
          // error: result.status,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return post;
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
          message: result.extensions![0].message,
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
          message: result.extensions![0].message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
