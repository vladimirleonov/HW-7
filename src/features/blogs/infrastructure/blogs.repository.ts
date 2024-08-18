import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}
  async save(blog: BlogDocument): Promise<BlogDocument> {
    return blog.save();
  }
  async findById(id: string): Promise<BlogDocument | null> {
    return this.blogModel.findById(id);
  }
  async delete(id: string): Promise<boolean> {
    const result = await this.blogModel.deleteOne({ _id: id });

    return result.deletedCount === 1;
  }
}
