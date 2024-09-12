import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { Comment } from '../domain/comments.entity';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ParseMongoIdPipe } from '../../../../core/pipes/parse-mongo-id.pipe';
import { OptionalJwtAuthGuard } from '../../../../core/guards/passport/optional-jwt-auth-guard';
import { OptionalUserId } from '../../../../core/decorators/param/current-user-optional-user-id.param.decorator';
import { CommentOutputModel } from './models/output/comment.output.model';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { NotFoundException } from '../../../../core/exception-filters/http-exception-filter';
import { JwtAuthGuard } from '../../../../core/guards/passport/jwt-auth.guard';
import { CommentUpdateModel } from './models/input/update-comment.input.model';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.usecase';
import { CommentLikeStatusUpdateModel } from './models/input/update-comment-like-status';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param.decorator';
import { UpdateCommentLikeStatusCommand } from '../application/use-cases/update-comment-like-status.usecase';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.usecase';

export const COMMENT_SORTING_PROPERTIES: SortingPropertiesType<Comment> = [
  'likesCount',
  'dislikesCount',
  'createdAt',
];

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  // @HttpCode(204)
  @UseGuards(OptionalJwtAuthGuard)
  async getOne(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @OptionalUserId() userId: string,
  ) {
    console.log('userId', userId);
    console.log('id', id);

    const comment: CommentOutputModel | null =
      await this.commentsQueryRepository.findById(id, userId);
    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  @Put('/:commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async update(
    @Param('commentId', new ParseMongoIdPipe()) commentId: string,
    @CurrentUserId() userId: string,
    @Body() commentUpdateModel: CommentUpdateModel,
  ) {
    console.log('commentUpdateModel', commentUpdateModel);
    const { content } = commentUpdateModel;

    console.log('commentId', commentId);
    const result: Result = await this.commandBus.execute(
      new UpdateCommentCommand(commentId, content, userId),
    );

    // const result: Result = await this.commentService.updateComment(
    //   req.params.commentId,
    //   req.body,
    //   req.user.userId,
    // );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    } else if (result.status === ResultStatus.Forbidden) {
      throw new ForbiddenException();
    }
  }

  @Put('/:commentId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async updateCommentLikeStatus(
    @Param('commentId', new ParseMongoIdPipe()) commentId: string,
    @Body() commentLikeStatusUpdateModel: CommentLikeStatusUpdateModel,
    @CurrentUserId() userId: string,
  ) {
    const { likeStatus } = commentLikeStatusUpdateModel;

    // const dto = {
    //   commentId: req.params.commentId,
    //   likeStatus: req.body.likeStatus,
    //   userId: req.user.userId,
    // };

    const result: Result = await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(commentId, likeStatus, userId),
    );
    // const result: Result = await this.commentService.updateLikeStatus(dto);
    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    }
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async delete(
    @Param('commentId', new ParseMongoIdPipe()) commentId: string,
    @CurrentUserId() userId: string,
  ) {
    const result: Result<boolean | null> = await this.commandBus.execute(
      new DeleteCommentCommand(commentId, userId),
    );

    // const result: Result<boolean | null> =
    //   await this.commentService.deleteComment(
    //     req.params.commentId,
    //     req.user.userId,
    //   );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    }
    if (result.status === ResultStatus.Forbidden) {
      throw new ForbiddenException();
    }
  }
}
