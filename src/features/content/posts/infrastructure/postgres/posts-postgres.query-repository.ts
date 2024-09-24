import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsPostgresQueryRepository {
  constructor() {} // @InjectModel('User') private readonly userModel: UserModelType, // @InjectModel(Post.name) private postModel: Model<Post>,

  // getAllPosts(pagination: Pagination, userId?: string): any {
  //   return this.__getResult({}, pagination, userId);
  // }
  //
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
  // // TODO: change type any
  // private async __getResult(
  //   filter: any,
  //   pagination: Pagination,
  //   userId?: string,
  // ): Promise<PaginationOutput<PostOutputModel>> {
  //   const posts = await this.postModel
  //     .find(filter)
  //     .sort({
  //       [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
  //     })
  //     .skip(pagination.getSkipItemsCount())
  //     .limit(pagination.pageSize);
  //
  //   const totalCount: number = await this.postModel.countDocuments(filter);
  //
  //   const mappedPosts = await Promise.all(
  //     posts.map((post) => PostOutputModelMapper(post, userId, this.userModel)),
  //   );
  //
  //   return new PaginationOutput<PostOutputModel>(
  //     mappedPosts,
  //     pagination.pageNumber,
  //     pagination.pageSize,
  //     totalCount,
  //   );
  // }
  //
  // async findById(id: string, userId?: string): Promise<PostOutputModel | null> {
  //   const post: PostDocument | null = await this.postModel.findById(id); // automatically converts string to ObjectId
  //
  //   if (post === null) {
  //     return null;
  //   }
  //   return PostOutputModelMapper(post, userId, this.userModel);
  // }
}
