import { PublishedStatus } from '../types/published-status';

export class PaginationQuery {
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: number;
  pageSize?: number;
}

export class PaginationWithSearchLoginAndEmailTermQuery extends PaginationQuery {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}

export class PaginationWithSearchNameTermQuery extends PaginationQuery {
  searchNameTerm?: string;
}

export class PaginationWithSearchBodyTermAndPublishedStatusQuery extends PaginationQuery {
  bodySearchTerm?: string;
  publishedStatus?: PublishedStatus;
}
