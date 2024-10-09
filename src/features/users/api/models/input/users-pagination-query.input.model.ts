import { PaginationQuery } from '../../../../../base/models/pagination-query.input.model';

export class UsersPaginationQuery extends PaginationQuery {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}
