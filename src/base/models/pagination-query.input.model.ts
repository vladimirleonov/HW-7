import { PublishedStatus } from '../types/published-status';

export class PaginationQueryBase {
  pageNumber?: number;
  pageSize?: number;
}

export class PaginationQueryParams extends PaginationQueryBase {
  sortBy?: string;
  sortDirection?: string;
}

export class MultiSortQueryParams extends PaginationQueryBase {
  sort?: string[];
}

export class SearchLoginAndEmailQueryParams extends PaginationQueryParams {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}

export class SearchNameQueryParams extends PaginationQueryParams {
  searchNameTerm?: string;
}

export class SearchBodyAndPublishedStatusQueryParams extends PaginationQueryParams {
  bodySearchTerm?: string;
  publishedStatus?: PublishedStatus;
}
