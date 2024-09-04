import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comments.entity';
import { Model } from 'mongoose';
import {
  Pagination,
  PaginationOutput,
} from '../../../base/models/pagination.base.model';
import {
  CommentOutputModel,
  CommentOutputModelMapper,
} from '../api/models/output/comment.output.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}
  getAllComments(pagination: Pagination, userId?: string): any {
    return this.__getResult({}, pagination, userId);
  }
  private async __getResult(
    filter: any,
    pagination: Pagination,
    userId: string,
  ): Promise<PaginationOutput<CommentOutputModel>> {
    const comments: CommentDocument[] = await this.commentModel
      .find(filter)
      .sort({
        [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
      })
      .skip(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    const totalCount: number = await this.commentModel.countDocuments(filter);

    const mappedComments: CommentOutputModel[] = comments.map(
      CommentOutputModelMapper,
    );

    return new PaginationOutput<CommentOutputModel>(
      mappedComments,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
