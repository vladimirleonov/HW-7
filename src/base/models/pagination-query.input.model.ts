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
