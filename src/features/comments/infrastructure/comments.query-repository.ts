import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';
import { FilterQuery } from 'mongoose';
import {
  Pagination,
  PaginationOutput,
} from '../../../base/models/pagination.base.model';
import {
  CommentOutputModel,
  CommentOutputModelMapper,
} from '../api/models/output/comment.output.model';
import { Blog } from '../../blogs/domain/blog.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
  ) {}
  getAllPostComments(
    pagination: Pagination,
    postId: string,
    userId: string,
  ): any {
    const byId: FilterQuery<Comment> = postId ? { postId: postId } : {};

    const orFilters: FilterQuery<Blog>[] = [byId].filter(
      (filter: FilterQuery<Blog>) => Object.keys(filter).length > 0,
    );

    const filter = orFilters.length > 0 ? { $or: orFilters } : {};

    return this.__getResult(filter, pagination, userId);
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

    const mappedComments: CommentOutputModel[] = comments.map((comment) =>
      CommentOutputModelMapper(comment, userId),
    );

    return new PaginationOutput<CommentOutputModel>(
      mappedComments,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
