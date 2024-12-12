import {
  Body,
  Controller,
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
import { PostOutputModel } from './models/output/post.output.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OptionalJwtAuthGuard } from '../../../../core/guards/passport/optional-jwt-auth-guard';
import { OptionalUserId } from '../../../../core/decorators/param-decorators/current-user-optional-user-id.param.decorator';
import { PostsTypeormQueryRepository } from '../infrastructure/typeorm/posts-typeorm.query-repository';
import {
  Pagination,
  PaginationOutput,
} from '../../../../base/models/pagination.base.model';
import {
  NotFoundException,
  UnauthorizedException,
} from '../../../../core/exception-filters/http-exception-filter';
import { JwtAuthGuard } from '../../../../core/guards/passport/jwt-auth.guard';
import { CurrentUserId } from '../../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { CommentCreateModel } from '../../comments/api/models/input/create-comment.input.model';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.usecase';
import { COMMENT_SORTING_PROPERTIES } from '../../comments/api/comments.controller';
import { PostUpdateLikeStatusModel } from './models/input/update-post-like-status.model';
import { UpdatePostLikeStatusCommand } from '../application/use-cases/update-post-like-status.usecase';
import { PaginationQuery } from '../../../../base/models/pagination-query.input.model';
import { PostsPaginationQuery } from './models/input/posts-pagination-query.input.model';
import { Post as PostEntity } from './../domain/post.entity';
import { GetAllPostsQuery } from './queries/get-all-posts.query';
import { GetPostQuery } from './queries/get-post.query';
import { GetCommentQuery } from '../../comments/api/queries/get-comment.query';
import { Comment } from '../../comments/domain/comment.entity';
import { GetPostCommentsQuery } from '../../comments/api/queries/get-post-comments.query';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogName', 'createdAt'];

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly postsTypeormQueryRepository: PostsTypeormQueryRepository,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getAll(
    @OptionalUserId() userId: number,
    @Query() query: PostsPaginationQuery,
  ) {
    const pagination: Pagination<PaginationQuery> = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES,
    );

    const posts: PaginationOutput<PostEntity> = await this.queryBus.execute<
      GetAllPostsQuery,
      PaginationOutput<PostEntity>
    >(new GetAllPostsQuery(pagination, userId));

    return posts;
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getOne(
    @Param('id', new ParseIntPipe()) id: number,
    @OptionalUserId() userId: number,
  ) {
    const post: PostEntity | null = await this.queryBus.execute<
      GetPostQuery,
      PostEntity | null
    >(new GetPostQuery(id, userId));

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @Get(':postId/comments')
  @UseGuards(OptionalJwtAuthGuard)
  async getPostComments(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Query() query: PaginationQuery,
    @OptionalUserId() userId: number,
  ) {
    const pagination: Pagination<PaginationQuery> = new Pagination(
      query,
      COMMENT_SORTING_PROPERTIES,
    );

    // TODO: is it ok?
    const post: PostOutputModel | null = await this.queryBus.execute<
      GetPostQuery,
      PostOutputModel | null
    >(new GetPostQuery(postId));

    if (!post) {
      throw new NotFoundException();
    }

    const comments: PaginationOutput<Comment> = await this.queryBus.execute<
      GetPostCommentsQuery,
      PaginationOutput<Comment>
    >(new GetPostCommentsQuery(pagination, postId, userId));

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

    const result = await this.commandBus.execute(
      new CreateCommentCommand(postId, content, userId),
    );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage!);
    }

    if (result.status === ResultStatus.Unauthorized) {
      throw new UnauthorizedException();
    }

    const commentId: number = result.data;

    const comment: Comment = await this.queryBus.execute<
      GetCommentQuery,
      Comment
    >(new GetCommentQuery(commentId, userId));

    return comment;
  }

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

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    }
  }
}
