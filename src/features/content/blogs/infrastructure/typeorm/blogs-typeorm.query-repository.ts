import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginationOutput,
  PaginationWithSearchNameTerm,
} from '../../../../../base/models/pagination.base.model';
import { Blog } from '../../domain/blog.entity';
import { SearchNameQueryParams } from '../../../../../base/models/pagination-query.input.model';
@Injectable()
export class BlogsTypeormQueryRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
  ) {}

  async getAll(
    pagination: PaginationWithSearchNameTerm<SearchNameQueryParams>,
  ): Promise<PaginationOutput<Blog>> {
    const query = this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'CAST(b.id AS text) as id',
        'b.name as name',
        'b.description as description',
        'b.websiteUrl as "websiteUrl"',
        'b.createdAt as "createdAt"',
        'b.isMembership as "isMembership"',
      ])
      // .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize);

    for (const sortItem of pagination.sort) {
      query.addOrderBy(`b.${sortItem.field}`, sortItem.direction);
    }

    if (pagination.searchNameTerm) {
      query.where('b.name ILIKE :name', {
        name: `%${pagination.searchNameTerm}%`,
      });
    }

    const blogs: Blog[] = await query.getRawMany();

    const totalCount: number = await query.getCount();

    return new PaginationOutput<Blog>(
      blogs,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  async findById(id: number) {
    const result = await this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'CAST(b.id AS text) as id',
        'b.name as name',
        'b.description as description',
        'b.websiteUrl as "websiteUrl"',
        'b.createdAt as "createdAt"',
        'b.isMembership as "isMembership"',
      ])
      .where('b.id = :id', { id: id })
      .getRawOne();

    return result;
  }
}
