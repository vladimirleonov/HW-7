import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}
  async save(post: PostDocument): Promise<PostDocument> {
    return post.save();
  }
  async findById(id: string): Promise<PostDocument | null> {
    return this.postModel.findById(id);
  }
  async delete(id: string): Promise<boolean> {
    const result = await this.postModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
