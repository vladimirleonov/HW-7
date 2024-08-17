import {
  Body,
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Param,
  Query, Put,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import {
  Pagination,
  PaginationOutput,
} from '../../../../base/models/pagination.base.model';
import { PostOutputModel } from './models/output/post.output.model';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { PostCreateModel } from './models/input/create-post.input.model';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}
  @Get()
  // TODO: change type any
  async getAll(@Query() query: any) {
    // let userId = null
    // if (req.headers.authorization) {
    //   const result: Result<JwtPayload | null> = await this.authService.checkAccessToken(req.headers.authorization)
    //   if (result.status === ResultStatus.Success) {
    //     userId = result.data!.userId
    //   }
    // }

    const pagination: Pagination = new Pagination(query, []);

    const posts: PaginationOutput<PostOutputModel> =
      await this.postsQueryRepository.getAll(pagination);

    return posts;
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    // let userId = null
    // if (req.headers.authorization) {
    //   const result: Result<JwtPayload | null> = await this.authService.checkAccessToken(req.headers.authorization)
    //   if (result.status === ResultStatus.Success) {
    //     userId = result.data!.userId
    //   }
    // }

    console.log(id);

    const post: PostOutputModel | null =
      await this.postsQueryRepository.findById(
        id,
        // userId,
      );

    if (!post) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Post with id ${id} not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return post;
  }

  @Post()
  async createPost(@Body() createModel: PostCreateModel) {
    const { title, shortDescription, content, blogId } = createModel;

    const result: Result<string | null> = await this.postsService.create(
      title,
      shortDescription,
      content,
      blogId,
    );
    // TODO: add check wasn't before
    if (result.status === ResultStatus.NotFound) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: result.extensions[0].message,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const createdId: string = result.data;

    const post: PostOutputModel | null =
      await this.postsQueryRepository.findById(createdId);

    if (!post) {
      // error if just created post not found
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return post;
  }

  @Put(':id')
  async update(@Body ) {

  }
}
