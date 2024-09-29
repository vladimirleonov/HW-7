import { Injectable } from '@nestjs/common';
import {
  Pagination,
  PaginationOutput,
} from '../../../../../base/models/pagination.base.model';
import {
  PostOutputModel,
  PostOutputModelMapper,
} from '../../api/models/output/post.output.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsPostgresQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {} // @InjectModel('User') private readonly userModel: UserModelType, // @InjectModel(Post.name) private postModel: Model<Post>,

  getAllPosts(pagination: Pagination, userId?: string): any {
    return this.__getResult('', pagination, userId);
  }

  // getAllBlogPosts(
  //   pagination: Pagination,
  //   blogId?: number,
  //   userId?: number,
  // ): any {
  //   // const filterByBlogId: FilterQuery<Post> = blogId
  //   //   ? { blogId: new mongoose.Types.ObjectId(blogId) }
  //   //   : {};
  //   //
  //   // const filter: FilterQuery<Post> = {
  //   //   ...filterByBlogId,
  //   // };
  //
  //   const whereClause: string | null = blogId ? `WHERE blog_id=$1` : null;
  //   const params = [blogId];
  //
  //   return this._getResult(whereClause, pagination, params);
  //
  //   // return this.__getResult(filter, pagination, userId);
  // }

  getAllBlogPosts(
    pagination: Pagination,
    blogId?: number,
    userId?: number,
  ): any {
    const whereClause: string = blogId ? `WHERE blog_id=$1` : '';
    const params = [blogId];

    return this.__getResult(whereClause, pagination, undefined, params);
  }

  // TODO: change type any
  private async __getResult(
    filter: string,
    pagination: Pagination,
    userId?: string,
    params: any = [],
  ): Promise<PaginationOutput<PostOutputModel>> {
    const query = `
      SELECT p.*, b.name as blog_name
      FROM posts p
      LEFT JOIN blogs b
      ON p.blog_id = b.id
      ${filter ? filter : ''}
      ORDER BY ${pagination.sortBy} ${pagination.sortDirection}
      OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
      LIMIT ${pagination.pageSize}
    `;

    const result = await this.dataSource.query(query, params);

    const countQuery = `
      SELECT count(*) as count 
      FROM posts
    `;

    const countResult = await this.dataSource.query(countQuery);

    const totalCount: number = Number(countResult[0].count);

    const mappedPosts = result.map(PostOutputModelMapper);

    return new PaginationOutput<PostOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  async findById(id: number, userId?: number): Promise<PostOutputModel | null> {
    const query = `
      SELECT p.*, b.name as blog_name 
      FROM posts p
      JOIN blogs b 
      ON p.blog_id = b.id
      WHERE p.id = $1
    `;

    const result = await this.dataSource.query(query, [id]);

    return result.length > 0 ? PostOutputModelMapper(result[0]) : null;
  }
}
