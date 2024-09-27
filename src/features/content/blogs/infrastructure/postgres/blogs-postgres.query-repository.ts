import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  Pagination,
  PaginationOutput,
  PaginationWithSearchNameTerm,
} from '../../../../../base/models/pagination.base.model';
import {
  BlogOutputModel,
  BlogOutputModelMapper,
} from '../../api/models/output/blog.output.model';

@Injectable()
export class BlogsPostgresQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getAll(
    pagination: PaginationWithSearchNameTerm,
  ): Promise<PaginationOutput<BlogOutputModel>> {
    // const searchNameTermFilter: FilterQuery<Blog> = pagination.searchNameTerm
    //   ? { name: { $regex: pagination.searchNameTerm, $options: 'i' } }
    //   : {};

    // const orFilters: FilterQuery<Blog>[] = [searchNameTermFilter].filter(
    //   (filter: FilterQuery<Blog>) => Object.keys(filter).length > 0,
    // );

    // const filter = orFilters.length > 0 ? { $or: orFilters } : {};

    let whereClause: string = '';
    const params: string[] = [];

    if (pagination.searchNameTerm) {
      whereClause += `name ILIKE $${params.length + 1}`;
      params.push(`%${pagination.searchNameTerm}%`);
    }

    const finalWhereClause = whereClause ? `WHERE ${whereClause}` : '';

    return this._getResult(finalWhereClause, pagination, params);
  }

  getAllBlogPosts(
    pagination: Pagination,
    blogId?: number,
    userId?: number,
  ): any {
    // const filterByBlogId: FilterQuery<Post> = blogId
    //   ? { blogId: new mongoose.Types.ObjectId(blogId) }
    //   : {};
    //
    // const filter: FilterQuery<Post> = {
    //   ...filterByBlogId,
    // };

    const whereClause: string | null = blogId ? `WHERE blogId=$1` : null;
    const params = [blogId];

    return this._getResult(whereClause, pagination, params);

    // return this.__getResult(filter, pagination, userId);
  }

  // // TODO: change type any
  async _getResult(
    filter: any,
    pagination: Pagination,
    params: any,
  ): Promise<PaginationOutput<BlogOutputModel>> {
    const query: string = `
      SELECT * FROM blogs
      ${filter ? filter : ''}
      ORDER BY ${pagination.sortBy} ${pagination.sortDirection}
      OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
      LIMIT ${pagination.pageSize}
    `;

    const result = await this.dataSource.query(query, params);
    //console.log('result', result);

    // count docs
    const countQuery: string = `
      SELECT COUNT(*) as count FROM blogs
      ${filter ? filter : ''}
    `;

    const countResult = await this.dataSource.query(countQuery, params);
    // console.log('countResult', countResult);
    const totalCount: number = Number(countResult[0].count);

    const mappedBlogs = result.map(BlogOutputModelMapper);

    return new PaginationOutput<BlogOutputModel>(
      mappedBlogs,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );

    // const blogs: BlogDocument[] = await this.blogModel
    //   .find(filter)
    //   .sort({
    //     [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
    //   })
    //   .skip(pagination.getSkipItemsCount())
    //   .limit(pagination.pageSize);
    //
    // const totalCount: number = await this.blogModel.countDocuments(filter);
    // const mappedBlogs: BlogOutputModel[] = blogs.map(BlogOutputModelMapper);
    //
    // return new PaginationOutput<BlogOutputModel>(
    //   mappedBlogs,
    //   pagination.pageNumber,
    //   pagination.pageSize,
    //   totalCount,
    // );
  }

  async findById(id: number) {
    const query: string = `
      SELECT * FROM blogs
      WHERE id = $1
    `;

    const result: string = await this.dataSource.query(query, [id]);

    return result.length > 0 ? BlogOutputModelMapper(result[0]) : null;

    // const blog: BlogDocument | null = await this.blogModel.findById(id);
    //
    // if (blog === null) {
    //   return null;
    // }
    // return BlogOutputModelMapper(blog);
  }
}
