import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import { Comment } from '../domain/comments.entity';

export const COMMENT_SORTING_PROPERTIES: SortingPropertiesType<Comment> = [
  'likesCount',
  'dislikesCount',
  'createdAt',
];
//
// @Controller('comments')
// export class CommentsController {
//   // @Get(':postId/comments')
//   // async getPostComments(@Query() query: any) {
//   //   const pagination: Pagination = new Pagination(
//   //     query,
//   //     COMMENT_SORTING_PROPERTIES,
//   //   );
//   //
//   //
//   // }
// }
