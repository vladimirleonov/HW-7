import { PaginationQuery } from '../../../../../../base/models/pagination-query.input.model';

export class BlogsPaginationQuery extends PaginationQuery {
  searchNameTerm?: string;
}
