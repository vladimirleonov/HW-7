import { PostDocument } from '../../../domain/post.entity';

export class PostOutputModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

// MAPPERS

export const PostOutputModelMapper = (post: PostDocument): PostOutputModel => {
  const outputModel: PostOutputModel = new PostOutputModel();

  console.log('PostDocument', post);

  outputModel.id = post.id;
  outputModel.title = post.title;
  outputModel.shortDescription = post.shortDescription;
  outputModel.content = post.content;
  outputModel.blogId = post.id;
  outputModel.blogName = post.blogName;
  outputModel.createdAt = post.createdAt.toISOString();

  return outputModel;
};
