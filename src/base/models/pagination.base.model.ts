import { toSnakeCase } from '../../core/utils/camel-case-to-snake-case';
import {
  PaginationQuery,
  PaginationWithSearchBodyTermAndPublishedStatusQuery,
  PaginationWithSearchLoginAndEmailTermQuery,
  PaginationWithSearchNameTermQuery,
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

export class Pagination<T extends PaginationQuery> {
  public sort: { field: string; direction: SortDirectionType }[];
  public readonly pageNumber: number;
  public readonly pageSize: number;

  constructor(
    query: T,
    sortProperties: string[],
    defaultSortBy: string = 'created_at',
  ) {
    this.sort = this.getSortArray(query, sortProperties, defaultSortBy);
    this.pageNumber = Number(query.pageNumber ?? 1);
    this.pageSize = Number(query.pageSize ?? 10);
  }

  private getSortArray(
    query: T,
    sortProperties: string[],
    defaultSortBy: string,
  ): { field: string; direction: SortDirectionType }[] {
    if (Array.isArray(query.sort)) {
      // Новый формат: массив строк "field direction"
      return query.sort
        .map((s) => {
          const [field, direction] = s.split(' ');

          if (!field) return null;

          return {
            field: toSnakeCase(field),
            direction: (direction?.toUpperCase() === 'ASC'
              ? 'ASC'
              : 'DESC') as SortDirectionType,
          };
        })
        .filter(
          (s): s is { field: string; direction: SortDirectionType } =>
            !!s && sortProperties.includes(s.field),
        );
    }

    // Старый формат: sortBy и sortDirection
    const sortBy = query.sortBy || defaultSortBy;
    const sortDirection: SortDirectionType =
      query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return [
      {
        field: toSnakeCase(sortBy),
        direction: sortDirection,
      },
    ];
  }

  public getSkipItemsCount() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

// export class Pagination<T extends PaginationQuery> {
//   public readonly sortBy: string;
//   public readonly sortDirection: SortDirectionType;
//   public readonly pageNumber: number;
//   public readonly pageSize: number;
//
//   constructor(
//     query: T,
//     sortProperties: string[],
//     defaultSortBy: string = 'created_at',
//   ) {
//     this.sortBy = this.getSortBy(query, sortProperties, defaultSortBy);
//     this.sortDirection = this.getSortDirection(query);
//     this.pageNumber = Number(query.pageNumber ?? 1);
//     this.pageSize = Number(query.pageSize ?? 10);
//   }
//
//   public getSortDirectionInNumericFormat(): -1 | 1 {
//     return this.sortDirection === 'DESC' ? -1 : 1;
//   }
//
//   public getSkipItemsCount() {
//     return (this.pageNumber - 1) * this.pageSize;
//   }
//
//   private getSortDirection(query: T): SortDirectionType {
//     let sortDirection: SortDirectionType = 'DESC';
//
//     switch (query.sortDirection?.toUpperCase()) {
//       case 'DESC': {
//         sortDirection = 'DESC';
//         break;
//       }
//       case 'ASC': {
//         sortDirection = 'ASC';
//         break;
//       }
//     }
//     return sortDirection;
//   }
//
//   private getSortBy(
//     query: T,
//     sortProperties: string[],
//     defaultSortBy: string,
//   ): string {
//     let result = defaultSortBy;
//
//     const querySortBy = query.sortBy;
//
//     if (querySortBy === undefined) {
//       return result;
//     }
//
//     // If query property sent as Array
//     if (Array.isArray(querySortBy)) {
//       for (let i: number = 0; i < querySortBy.length; i++) {
//         const param = querySortBy[i];
//
//         if (sortProperties.includes(param.toString())) {
//           // result = param.toString();
//           result = toSnakeCase(param.toString());
//           break;
//         }
//       }
//     } else {
//       if (sortProperties.includes(querySortBy.toString())) {
//         // result = querySortBy.toString();
//         result = toSnakeCase(querySortBy.toString());
//       }
//     }
//
//     return result;
//   }
// }

export class GamePagination<T extends PaginationQuery> extends Pagination<T> {
  constructor(query, sortProperties) {
    super(query, sortProperties, 'pair_created_date');
  }
}

export class PaginationWithSearchLoginAndEmailTerm<
  T extends PaginationWithSearchLoginAndEmailTermQuery,
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
  T extends PaginationWithSearchNameTermQuery,
> extends Pagination<T> {
  public readonly searchNameTerm: string | null;

  constructor(query: T, sortProperties: string[]) {
    super(query, sortProperties);
    this.searchNameTerm = query.searchNameTerm?.toString() || null;
  }
}

export class PaginationWithBodySearchTermAndPublishedStatus<
  T extends PaginationWithSearchBodyTermAndPublishedStatusQuery,
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
