import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { CommentOutputModel } from './models/output/comment.output.model';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OptionalUserId } from '../../../../core/decorators/param-decorators/current-user-optional-user-id.param.decorator';
import { OptionalJwtAuthGuard } from '../../../../core/guards/passport/optional-jwt-auth-guard';
import {
  ForbiddenException,
  NotFoundException,
} from '../../../../core/exception-filters/http-exception-filter';
import { JwtAuthGuard } from '../../../../core/guards/passport/jwt-auth.guard';
import { CurrentUserId } from '../../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { CommentUpdateModel } from './models/input/update-comment.input.model';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.usecase';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.usecase';
import { CommentLikeStatusUpdateModel } from './models/input/update-comment-like-status';
import { UpdateCommentLikeStatusCommand } from '../application/use-cases/update-comment-like-status.usecase';
import { Comment } from '../domain/comment.entity';
import { GetCommentQuery } from './queries/get-comment.query';

export const COMMENT_SORTING_PROPERTIES: SortingPropertiesType<CommentOutputModel> =
  ['createdAt'];

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getOne(
    @Param('id', new ParseIntPipe()) id: number,
    @OptionalUserId() userId: number,
  ) {
    const comment: Comment | null = await this.queryBus.execute<
      GetCommentQuery,
      Comment
    >(new GetCommentQuery(id, userId));

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  @Put('/:commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @CurrentUserId() userId: number,
    @Body() commentUpdateModel: CommentUpdateModel,
  ) {
    const { content } = commentUpdateModel;

    const result: Result = await this.commandBus.execute(
      new UpdateCommentCommand(commentId, content, userId),
    );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    } else if (result.status === ResultStatus.Forbidden) {
      throw new ForbiddenException();
    }
  }

  @Put('/:commentId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @Body() commentLikeStatusUpdateModel: CommentLikeStatusUpdateModel,
    @CurrentUserId() userId: number,
  ) {
    const { likeStatus } = commentLikeStatusUpdateModel;

    const result: Result = await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(commentId, likeStatus, userId),
    );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    }
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @CurrentUserId() userId: number,
  ) {
    const result: Result<boolean | null> = await this.commandBus.execute(
      new DeleteCommentCommand(commentId, userId),
    );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    } else if (result.status === ResultStatus.Forbidden) {
      throw new ForbiddenException();
    }
  }
}
