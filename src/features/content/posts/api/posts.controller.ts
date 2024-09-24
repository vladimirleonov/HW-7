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
import { PostOutputModel } from './models/output/post.output.model';
import { PostCreateModel } from './models/input/create-post.input.model';
import { PostUpdateModel } from './models/input/update-post.input.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param.decorator';
import { PostUpdateLikeStatusModel } from './models/input/update-post-like-status.model';
import { JwtAuthGuard } from '../../../../core/guards/passport/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../../core/guards/passport/optional-jwt-auth-guard';
import { OptionalUserId } from '../../../../core/decorators/param/current-user-optional-user-id.param.decorator';
import { CommentCreateModel } from '../../comments/api/models/input/create-comment.input.model';
import { BasicAuthGuard } from '../../../../core/guards/passport/basic-auth.guard';
import { PostsPostgresQueryRepository } from '../infrastructure/postgres/posts-postgres.query-repository';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogName', 'createdAt'];

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsPostgresQueryRepository: PostsPostgresQueryRepository,
    // private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  // TODO: change type any
  async getAll(@OptionalUserId() userId: string, @Query() query: any) {
    // const pagination: Pagination = new Pagination(
    //   query,
    //   POSTS_SORTING_PROPERTIES,
    // );
    //
    // const posts: PaginationOutput<PostOutputModel> =
    //   await this.postsQueryRepository.getAllPosts(pagination, userId);
    //
    // return posts;
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getOne(
    @Param('id', new ParseIntPipe()) id: number,
    @OptionalUserId() userId: number,
  ) {
    // const post: PostOutputModel | null =
    //   await this.postsQueryRepository.findById(id, userId);
    //
    // if (!post) {
    //   throw new NotFoundException();
    // }
    //
    // return post;
  }

  @Get(':postId/comments')
  @UseGuards(OptionalJwtAuthGuard)
  async getPostComments(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Query() query: any,
    @OptionalUserId() userId: number,
  ) {
    // const pagination: Pagination = new Pagination(
    //   query,
    //   COMMENT_SORTING_PROPERTIES,
    // );
    //
    // // TODO: CreateDecorator to check corrent postId
    // const post: PostOutputModel | null =
    //   await this.postsQueryRepository.findById(postId);
    //
    // if (!post) {
    //   throw new NotFoundException();
    // }
    //
    // const comments: PaginationOutput<PostOutputModel> =
    //   await this.commentsQueryRepository.getAllPostComments(
    //     pagination,
    //     postId,
    //     userId,
    //   );
    //
    // return comments;
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createPostComment(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Body() commentCreateModel: CommentCreateModel,
    @CurrentUserId() userId: number,
  ) {
    // const { content } = commentCreateModel;
    //
    // const result: Result<string | null> = await this.commandBus.execute(
    //   new CreateCommentCommand(postId, content, userId),
    // );
    //
    // if (result.status === ResultStatus.NotFound) {
    //   throw new NotFoundException(result.errorMessage!);
    // }
    //
    // if (result.status === ResultStatus.Unauthorized) {
    //   throw new UnauthorizedException();
    // }
    //
    // const comment: CommentOutputModel | null =
    //   await this.commentsQueryRepository.findById(result.data!, userId);
    //
    // if (!comment) {
    //   //error if just created comment not found
    //   throw new InternalServerErrorException();
    // }
    //
    // return comment;
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() createModel: PostCreateModel) {
    // const { title, shortDescription, content, blogId } = createModel;
    //
    // const result: Result<string | null> = await this.commandBus.execute<
    //   CreatePostCommand,
    //   Result<string | null>
    // >(new CreatePostCommand(title, shortDescription, content, blogId));
    //
    // // TODO: add check wasn't before
    // if (result.status === ResultStatus.NotFound) {
    //   throw new NotFoundException(result.errorMessage!);
    // }
    //
    // const createdId: string = result.data!;
    //
    // const post: PostOutputModel | null =
    //   await this.postsQueryRepository.findById(createdId);
    //
    // if (!post) {
    //   // error if just created post not found
    //   throw new InternalServerErrorException();
    // }
    //
    // return post;
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateModel: PostUpdateModel,
  ) {
    // const { title, shortDescription, content, blogId } = updateModel;
    //
    // const result: Result = await this.commandBus.execute<
    //   UpdatePostCommand,
    //   Result
    // >(new UpdatePostCommand(id, title, shortDescription, content, blogId));
    //
    // if (result.status === ResultStatus.NotFound) {
    //   throw new NotFoundException(result.errorMessage!);
    // }
  }

  @Put(':postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostLikeStatus(
    @Param('postId', new ParseIntPipe()) postId: number,
    @CurrentUserId() userId: number,
    @Body() postUpdateLikeStatusModel: PostUpdateLikeStatusModel,
  ) {
    // const { likeStatus } = postUpdateLikeStatusModel;
    //
    // const result: Result = await this.commandBus.execute(
    //   new UpdatePostLikeStatusCommand(likeStatus, postId, userId),
    // );
    //
    // if (result.status === ResultStatus.NotFound) {
    //   throw new NotFoundException();
    // }
    //
    // return;
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseIntPipe()) id: number) {
    // const result: Result = await this.commandBus.execute<
    //   DeletePostCommand,
    //   Result
    // >(new DeletePostCommand(id));
    //
    // if (result.status === ResultStatus.NotFound) {
    //   throw new NotFoundException(result.errorMessage!);
    // }
  }
}
