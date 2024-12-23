import {
  MultiSortQueryParams,
  PaginationQueryBase,
  SearchBodyAndPublishedStatusQueryParams,
  SearchLoginAndEmailQueryParams,
  SearchNameQueryParams,
} from './pagination-query.input.model';
import { PublishedStatus } from '../types/published-status';

export class PaginationOutput<D> {
  public readonly pagesCount: number;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly totalCount: number;
  public readonly items: D[];

  constructor(items: D[], page: number, pageSize: number, totalCount: number) {
    this.items = items;
    this.page = page;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.pagesCount = Math.ceil(totalCount / pageSize);
  }
}

export class Pagination<T extends PaginationQueryBase> {
  public sort: { field: string; direction: SortDirectionType }[];
  public readonly pageNumber: number;
  public readonly pageSize: number;

  constructor(
    query: T,
    sortProperties: string[],
    defaultSortBy:
      | string
      | { field: string; direction: SortDirectionType }[] = 'created_at',
  ) {
    this.sort = this.getSortArray(query, sortProperties, defaultSortBy);
    this.pageNumber = Number(query.pageNumber ?? 1);
    this.pageSize = Number(query.pageSize ?? 10);
  }

  protected getSortArray(
    query: T,
    sortProperties: string[],
    defaultSortBy: string | { field: string; direction: SortDirectionType }[],
  ): { field: string; direction: SortDirectionType }[] {
    // if query.sort is string
    if ('sort' in query && typeof query.sort === 'string') {
      const [field, direction] = query.sort.split(' ');
      if (sortProperties.includes(field)) {
        return [
          {
            field: field, // Convert the field name to snake_case
            direction: (direction?.toUpperCase() === 'ASC'
              ? 'ASC'
              : 'DESC') as SortDirectionType, // Set the sort direction (default is DESC)
          },
        ];
      }
      return [];
    }

    // if query.sort is array
    if ('sort' in query && Array.isArray(query.sort)) {
      // If query.sort is an array of strings in the format "field direction"
      return query.sort
        .map((s) => {
          const [field, direction] = s.split(' '); // Split the string into field name and sort direction
          console.log(field, direction);
          if (!field) return null; // Skip if the field is missing

          return {
            field: field, // Convert the field name to snake_case
            direction: (direction?.toUpperCase() === 'ASC'
              ? 'ASC'
              : 'DESC') as SortDirectionType, // Set the sort direction (default is DESC)
          };
        })
        .filter(
          (s): s is { field: string; direction: SortDirectionType } =>
            !!s && sortProperties.includes(s.field), // Remove `null` and keep only valid fields
        );
    }

    // Determine the `sortBy` value from the query or default settings:
    // 1. If `query.sortBy` exists and is a string, use it (e.g., sortBy = "avgScores").
    // 2. If `defaultSortBy` is an array, set `sortBy` to an empty string (e.g., sortBy = "").
    // 3. If `defaultSortBy` is a string, use it as `sortBy` (e.g., sortBy = "avgScores").
    const sortBy: string =
      'sortBy' in query && typeof query.sortBy === 'string' && query.sortBy
        ? query.sortBy
        : Array.isArray(defaultSortBy)
          ? ''
          : defaultSortBy;

    const sortDirection: SortDirectionType =
      'sortDirection' in query &&
      typeof query.sortDirection === 'string' &&
      query.sortDirection.toUpperCase() === 'ASC'
        ? 'ASC'
        : 'DESC';

    // If `defaultSortBy` is an array, use it as the default sort array.
    // If it is a string, create a single sort object based on `sortBy` and `sortDirection`.
    const defaultSortArray = Array.isArray(defaultSortBy)
      ? defaultSortBy
      : [
          {
            field: sortBy,
            direction: sortDirection,
          },
        ];

    // Filter the defaultSortArray:
    // - Keep only elements that are objects and have a `field` property.
    // - Ensure the `field` is in the list of allowed fields (`sortProperties`).
    return defaultSortArray.filter(
      (s): s is { field: string; direction: SortDirectionType } =>
        sortProperties.includes(s?.field || ''),
    );
  }

  public getSkipItemsCount() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export class PaginationWithScores<
  T extends MultiSortQueryParams,
> extends Pagination<T> {
  constructor(query, sortProperties) {
    super(query, sortProperties, [
      { field: 'avgScores', direction: 'DESC' },
      { field: 'sumScore', direction: 'DESC' },
    ]);
  }
}

export class PaginationWithSearchLoginAndEmailTerm<
  T extends SearchLoginAndEmailQueryParams,
> extends Pagination<T> {
  public readonly searchLoginTerm: string | null;
  public readonly searchEmailTerm: string | null;

  constructor(query: T, sortProperties: string[]) {
    super(query, sortProperties);

    this.searchLoginTerm = query.searchLoginTerm?.toString() || null;
    this.searchEmailTerm = query.searchEmailTerm?.toString() || null;
  }
}

export class PaginationWithSearchNameTerm<
  T extends SearchNameQueryParams,
> extends Pagination<T> {
  public readonly searchNameTerm: string | null;

  constructor(query: T, sortProperties: string[]) {
    super(query, sortProperties);
    this.searchNameTerm = query.searchNameTerm?.toString() || null;
  }
}

export class PaginationWithBodySearchTermAndPublishedStatus<
  T extends SearchBodyAndPublishedStatusQueryParams,
> extends Pagination<T> {
  public readonly bodySearchTerm: string | null;
  public readonly publishedStatus: PublishedStatus;

  constructor(query: T, sortProperties: string[]) {
    super(query, sortProperties);
    this.bodySearchTerm = query.bodySearchTerm?.toString() || null;
    this.publishedStatus = this.getPublishedStatus(query);
  }

  private getPublishedStatus(query: T): PublishedStatus {
    let publishedStatus: PublishedStatus = PublishedStatus.ALL;

    switch (query.sortDirection?.toUpperCase()) {
      case PublishedStatus.PUBLISHED: {
        publishedStatus = PublishedStatus.PUBLISHED;
        break;
      }
      case PublishedStatus.NOT_PUBLISHED: {
        publishedStatus = PublishedStatus.NOT_PUBLISHED;
        break;
      }
    }
    return publishedStatus;
  }
}

// TYPES
export type SortDirectionType = 'DESC' | 'ASC';
