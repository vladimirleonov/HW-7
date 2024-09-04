import { Controller, Get, Query } from '@nestjs/common';
import { Pagination } from '../../../base/models/pagination.base.model';
import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';

export const COMMENT_SORTING_PROPERTIES: SortingPropertiesType<> = [
  'likesCount',
  'dislikesCount',
  'createdAt',
];

@Controller('comments')
export class CommentsController {
  // @Get(':postId/comments')
  // async getPostComments(@Query() query: any) {
  //   const pagination: Pagination = new Pagination(
  //     query,
  //     COMMENT_SORTING_PROPERTIES,
  //   );
  //
  //
  // }
}
