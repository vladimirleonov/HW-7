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
import { PostsService } from '../application/posts.service';
import {
  Pagination,
  PaginationOutput,
} from '../../../base/models/pagination.base.model';
import { PostOutputModel } from './models/output/post.output.model';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { PostCreateModel } from './models/input/create-post.input.model';
import { PostUpdateModel } from './models/input/update-post.input.model';
import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import { ParseMongoIdPipe } from '../../../core/pipes/parse-mongo-id.pipe';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogName'];

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

    const pagination: Pagination = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES,
    );

    const posts: PaginationOutput<PostOutputModel> =
      await this.postsQueryRepository.getAllPosts(pagination);

    return posts;
  }

  @Get(':id')
  async getOne(@Param('id', new ParseMongoIdPipe()) id: string) {
    // let userId = null
    // if (req.headers.authorization) {
    //   const result: Result<JwtPayload | null> = await this.authService.checkAccessToken(req.headers.authorization)
    //   if (result.status === ResultStatus.Success) {
    //     userId = result.data!.userId
    //   }
    // }

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
  async create(@Body() createModel: PostCreateModel) {
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
          message: result.extensions![0].message,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const createdId: string = result.data!;

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
  @HttpCode(204)
  async update(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() updateModel: PostUpdateModel,
  ) {
    // if (!req.user || !req.user.userId) {
    //   res.status(HTTP_CODES.UNAUTHORIZED).send()
    //   return
    // }

    const { title, shortDescription, content, blogId } = updateModel;

    const result: Result = await this.postsService.update(
      id,
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
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new ParseMongoIdPipe()) id: string) {
    const result: Result = await this.postsService.delete(id);

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
