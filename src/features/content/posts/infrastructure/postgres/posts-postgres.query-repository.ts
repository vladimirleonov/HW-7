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
    return this.__getResult({}, pagination, userId);

    //return this.__getResult({}, pagination, userId);
  }

  // getAllBlogPosts(
  //   pagination: Pagination,
  //   blogId?: string,
  //   userId?: string,
  // ): any {
  //   const filterByBlogId: FilterQuery<Post> = blogId
  //     ? { blogId: new mongoose.Types.ObjectId(blogId) }
  //     : {};
  //
  //   const filter: FilterQuery<Post> = {
  //     ...filterByBlogId,
  //   };
  //
  //   return this.__getResult(filter, pagination, userId);
  // }
  //
  // TODO: change type any
  private async __getResult(
    filter: any,
    pagination: Pagination,
    userId?: string,
  ): Promise<PaginationOutput<PostOutputModel>> {
    // const posts = await this.postModel
    //   .find(filter)
    //   .sort({
    //     [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
    //   })
    //   .skip(pagination.getSkipItemsCount())
    //   .limit(pagination.pageSize);

    const query = `
      SELECT p.*, b.name as blog_name
      FROM posts p
      LEFT JOIN blogs b
      ON p.blog_id = b.id
      ORDER BY ${pagination.sortBy} ${pagination.sortDirection}
      OFFSET ${(pagination.pageNumber - 1) * pagination.pageSize}
      LIMIT ${pagination.pageSize}
    `;

    const result = await this.dataSource.query(query);
    console.log('result', result);

    const countQuery = `
      SELECT count(*) as count 
      FROM posts
    `;

    const countResult = await this.dataSource.query(countQuery);
    console.log(countResult);
    const totalCount: number = Number(countResult[0].count);

    const mappedPosts = result.map(PostOutputModelMapper);

    return new PaginationOutput<PostOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );

    // const totalCount: number = await this.postModel.countDocuments(filter);

    // const mappedPosts = await Promise.all(
    //   posts.map((post) => PostOutputModelMapper(post, userId, this.userModel)),
    // );

    // return new PaginationOutput<PostOutputModel>(
    //   mappedPosts,
    //   pagination.pageNumber,
    //   pagination.pageSize,
    //   totalCount,
    // );
  }

  // async findById(id: string, userId?: string): Promise<PostOutputModel | null> {
  //   const post: PostDocument | null = await this.postModel.findById(id); // automatically converts string to ObjectId
  //
  //   if (post === null) {
  //     return null;
  //   }
  //   return PostOutputModelMapper(post, userId, this.userModel);
  // }
}
