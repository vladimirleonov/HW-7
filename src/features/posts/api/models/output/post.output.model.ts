import { PostDocument } from '../../../domain/post.entity';
import mongoose, { Mongoose } from 'mongoose';

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

  outputModel.id = post.id;
  outputModel.title = post.title;
  outputModel.shortDescription = post.shortDescription;
  outputModel.content = post.content;
  outputModel.blogId = post.blogId.toString();
  outputModel.blogName = post.blogName;
  outputModel.createdAt = post.createdAt.toISOString();

  return outputModel;
};
