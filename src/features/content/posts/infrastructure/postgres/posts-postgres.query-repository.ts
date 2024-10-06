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

  getAllPosts(pagination: Pagination, userId?: number): any {
    return this.__getResult('', pagination, [], userId);
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
    blogId: number,
    userId?: number,
  ): any {
    // console.log('userId', userId);
    // console.log('blogId', blogId);
    let whereClause: string = '';
    const params: string | number[] = [];

    whereClause += `WHERE p.blog_id=$${params.length + 1}`;
    // console.log('params.length + 1', params.length + 1);
    params.push(blogId);

    return this.__getResult(whereClause, pagination, params, userId);
  }

  // TODO: change type any
  private async __getResult(
    postsFilter: string,
    pagination: Pagination,
    params: any = [],
    userId?: number,
  ): Promise<any> {
    // : Promise<PaginationOutput<PostOutputModel>>
    let whereClause = '';
    if (userId) {
      whereClause += `AND pl.author_id=$${params.length + 1}`;
      //console.log('params.length + 1', params.length + 1);
      params.push(userId);
    }
    //console.log('params', params);

    const query = `
      SELECT p.id, p.title, p.short_description, p.content, p.blog_id, p.created_at,
      (
        SELECT b.name as blog_name
        FROM blogs b
        WHERE b.id = p.blog_id  
      ),
      json_build_object(
        'likes_count', p.likes_count,
        'dislikes_count', p.dislikes_count,
        'my_status', (
            SELECT status
            FROM post_likes pl
            WHERE pl.post_id = p.id ${whereClause}  
        ),
        'newest_likes', (
          SELECT json_agg(
            json_build_object(
                'added_at', recent_likes.created_at,
                'user_id', recent_likes.author_id,
                'login', recent_likes.login
            )  
          )   
          FROM (
            SELECT pl.created_at, pl.author_id, u.login
            FROM post_likes pl
            JOIN users u ON pl.author_id = u.id
            WHERE pl.post_id = p.id
            ORDER BY pl.created_at DESC
            LIMIT 3   
          ) as recent_likes
        )
      ) as "extended_likes_info"
      FROM posts p
      ${postsFilter}
      ORDER BY ${pagination.sortBy} ${pagination.sortDirection}
      OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
      LIMIT ${pagination.pageSize}
    `;

    // console.log(query);

    const result = await this.dataSource.query(query, params);
    // console.log('result', result);

    const countQuery = `
      SELECT count(*) as count
      FROM posts p
      ${postsFilter}
    `;

    const countResult = await this.dataSource.query(countQuery, [params[0]]);

    const totalCount: number = Number(countResult[0].count);
    // console.log('totalCount', totalCount);

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
      SELECT p.id, p.title, p.short_description, p.content, p.blog_id, p.created_at,
      (
        SELECT b.name FROM blogs b 
        WHERE b.id = p.blog_id 
      ) as "blog_name",
      json_build_object(
        'likes_count', p.likes_count, 
        'dislikes_count', p.dislikes_count,
        'newest_likes', (
          SELECT json_agg(
            json_build_object(
              'added_at', pl.created_at,
              'user_id', pl.author_id,
              'login', u.login
            )
          ) FROM (
            SELECT pl.created_at, pl.author_id
            FROM post_likes pl
            WHERE pl.post_id = $1
            ORDER BY pl.created_at DESC
            LIMIT 3 -- Выбираем три последних лайка для текущего поста
          ) pl
          LEFT JOIN users u ON pl.author_id = u.id
        )
      ) AS "extended_likes_info"
      FROM posts p
      GROUP BY p.id, p.title, p.short_description, p.content, p.blog_id, p.likes_count, p.dislikes_count
    `;

    const result = await this.dataSource.query(query, [id]);

    return result.length > 0 ? PostOutputModelMapper(result[0]) : null;
  }
}
