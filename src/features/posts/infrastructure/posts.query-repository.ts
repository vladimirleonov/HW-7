import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import mongoose, { FilterQuery, Model } from 'mongoose';
import {
  Pagination,
  PaginationOutput,
} from '../../../../base/models/pagination.base.model';
import {
  PostOutputModel,
  PostOutputModelMapper,
} from '../api/models/output/post.output.model';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}
  getAllPosts(pagination: Pagination, userId?: string): any {
    // const filterByBlogId: FilterQuery<Post> = blogId ? { blogId: blogId } : {};
    //
    // const filter: FilterQuery<Post> = {
    //   ...filterByBlogId,
    // };

    // const posts: Post[] = await PostModel
    //   .find(filter)
    //   .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
    //   .skip((query.pageNumber - 1) * query.pageSize)
    //   .limit(query.pageSize).lean()
    //
    // const totalCount: number = await PostModel
    //   .countDocuments(filter)
    //
    // const postsForOutput: PostOutputViewModel[] = await Promise.all(
    //   posts.map(async (post: Post): Promise<PostOutputViewModel> => await this.mapToOutput(post, userId))
    // )
    //
    // return {
    //   pagesCount: Math.ceil(totalCount / query.pageSize),
    //   page: query.pageNumber,
    //   pageSize: query.pageSize,
    //   totalCount,
    //   items: postsForOutput

    return this.__getResult({}, pagination);
  }
  getAllBlogPosts(
    pagination: Pagination,
    //userId?: string,
    blogId?: string,
  ): any {
    const filterByBlogId: FilterQuery<Post> = blogId
      ? { blogId: new mongoose.Types.ObjectId(blogId) }
      : {};

    const filter: FilterQuery<Post> = {
      ...filterByBlogId,
    };

    // const posts: Post[] = await PostModel
    //   .find(filter)
    //   .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
    //   .skip((query.pageNumber - 1) * query.pageSize)
    //   .limit(query.pageSize).lean()
    //
    // const totalCount: number = await PostModel
    //   .countDocuments(filter)
    //
    // const postsForOutput: PostOutputViewModel[] = await Promise.all(
    //   posts.map(async (post: Post): Promise<PostOutputViewModel> => await this.mapToOutput(post, userId))
    // )
    //
    // return {
    //   pagesCount: Math.ceil(totalCount / query.pageSize),
    //   page: query.pageNumber,
    //   pageSize: query.pageSize,
    //   totalCount,
    //   items: postsForOutput

    return this.__getResult(filter, pagination);
  }
  // TODO: change type any
  private async __getResult(
    filter: any,
    pagination: Pagination,
  ): Promise<PaginationOutput<PostOutputModel>> {
    const posts: PostDocument[] = await this.postModel
      .find(filter)
      .sort({
        [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
      })
      .skip(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    const totalCount: number = await this.postModel.countDocuments(filter);

    const mappedPosts: PostOutputModel[] = posts.map(PostOutputModelMapper);

    return new PaginationOutput<PostOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
  async findById(id: string): Promise<PostOutputModel | null> {
    const post: PostDocument | null = await this.postModel.findById(id); // automatically converts string to ObjectId
    //.findOne({_id: new ObjectId(postId)})
    if (post === null) {
      return null;
    }
    return PostOutputModelMapper(post);
  }
}
