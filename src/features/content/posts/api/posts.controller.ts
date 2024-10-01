import {
  Body,
  Controller,
  Get, HttpCode, HttpStatus,
  Param,
  ParseIntPipe,
  Post, Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostOutputModel } from './models/output/post.output.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { CommandBus } from '@nestjs/cqrs';
import { OptionalJwtAuthGuard } from '../../../../core/guards/passport/optional-jwt-auth-guard';
import { OptionalUserId } from '../../../../core/decorators/param-decorators/current-user-optional-user-id.param.decorator';
import { PostsPostgresQueryRepository } from '../infrastructure/postgres/posts-postgres.query-repository';
import {
  Pagination,
  PaginationOutput,
} from '../../../../base/models/pagination.base.model';
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '../../../../core/exception-filters/http-exception-filter';
import { JwtAuthGuard } from '../../../../core/guards/passport/jwt-auth.guard';
import { CurrentUserId } from '../../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { CommentCreateModel } from '../../comments/api/models/input/create-comment.input.model';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.usecase';
import { CommentsPostgresQueryRepository } from '../../comments/infrastructure/postgres/comments.query-repository';
import { COMMENT_SORTING_PROPERTIES } from '../../comments/api/comments.controller';
import { PostUpdateLikeStatusModel } from './models/input/update-post-like-status.model';
import { UpdatePostLikeStatusCommand } from '../application/use-cases/update-post-like-status.usecase';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogName', 'createdAt'];

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsPostgresQueryRepository: PostsPostgresQueryRepository,
    private readonly commentsPostgresQueryRepository: CommentsPostgresQueryRepository,
  ) {}
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  // TODO: change type any
  async getAll(@OptionalUserId() userId: string, @Query() query: any) {
    const pagination: Pagination = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES,
    );

    const posts: PaginationOutput<PostOutputModel> =
      await this.postsPostgresQueryRepository.getAllPosts(pagination, userId);

    return posts;
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getOne(
    @Param('id', new ParseIntPipe()) id: number,
    @OptionalUserId() userId: number,
  ) {
    const post: PostOutputModel | null =
      await this.postsPostgresQueryRepository.findById(id, userId);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @Get(':postId/comments')
  @UseGuards(OptionalJwtAuthGuard)
  async getPostComments(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Query() query: any,
    @OptionalUserId() userId: number,
  ) {
    const pagination: Pagination = new Pagination(
      query,
      COMMENT_SORTING_PROPERTIES,
    );

    // TODO: CreateDecorator to check corrent postId
    const post: PostOutputModel | null =
      await this.postsPostgresQueryRepository.findById(postId);

    if (!post) {
      throw new NotFoundException();
    }

    const comments: PaginationOutput<PostOutputModel> =
      await this.commentsPostgresQueryRepository.getAllPostComments(
        pagination,
        postId,
        userId,
      );

    return comments;
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createPostComment(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Body() commentCreateModel: CommentCreateModel,
    @CurrentUserId() userId: number,
  ) {
    const { content } = commentCreateModel;

    const result: Result<string | null> = await this.commandBus.execute(
      new CreateCommentCommand(postId, content, userId),
    );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage!);
    }

    if (result.status === ResultStatus.Unauthorized) {
      throw new UnauthorizedException();
    }

    const comment = await this.commentsPostgresQueryRepository.findById(
      result.data!,
      // userId,
    );

    if (!comment) {
      //error if just created comment not found
      throw new InternalServerErrorException();
    }

    return comment;
  }

  // @Post()
  // @UseGuards(BasicAuthGuard)
  // async create(@Body() createModel: PostCreateModel) {
  //   const { title, shortDescription, content, blogId } = createModel;
  //
  //   const result: Result<string | null> = await this.commandBus.execute<
  //     CreatePostCommand,
  //     Result<string | null>
  //   >(new CreatePostCommand(title, shortDescription, content, blogId));
  //
  //   // TODO: add check wasn't before
  //   if (result.status === ResultStatus.NotFound) {
  //     throw new NotFoundException(result.errorMessage!);
  //   }
  //
  //   const createdId: string = result.data!;
  //
  //   const post: PostOutputModel | null =
  //     await this.postsQueryRepository.findById(createdId);
  //
  //   if (!post) {
  //     // error if just created post not found
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
  //   @Body() updateModel: PostUpdateModel,
  // ) {
  //   const { title, shortDescription, content, blogId } = updateModel;
  //
  //   const result: Result = await this.commandBus.execute<
  //     UpdatePostCommand,
  //     Result
  //   >(new UpdatePostCommand(id, title, shortDescription, content, blogId));
  //
  //   if (result.status === ResultStatus.NotFound) {
  //     throw new NotFoundException(result.errorMessage!);
  //   }
  // }

  @Put(':postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostLikeStatus(
    @Param('postId', new ParseIntPipe()) postId: number,
    @CurrentUserId() userId: number,
    @Body() postUpdateLikeStatusModel: PostUpdateLikeStatusModel,
  ) {
    const { likeStatus } = postUpdateLikeStatusModel;

    const result: Result = await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(likeStatus, postId, userId),
    );

    console.log("result in controller", result);

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    }

    return;
  }

  // @Delete(':id')
  // @UseGuards(BasicAuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async delete(@Param('id', new ParseIntPipe()) id: number) {
  //   const result: Result = await this.commandBus.execute<
  //     DeletePostCommand,
  //     Result
  //   >(new DeletePostCommand(id));
  //
  //   if (result.status === ResultStatus.NotFound) {
  //     throw new NotFoundException(result.errorMessage!);
  //   }
  // }
}
