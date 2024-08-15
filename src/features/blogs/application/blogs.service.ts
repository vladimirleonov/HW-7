import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { Model } from 'mongoose';
import { ResultStatus } from '../../../../base/types/object-result';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private readonly blogModel: Model<Blog>,
  ) {}
  async create(name: string, description: string, websiteUrl: string) {
    // ??? how to create user correctly
    const newBlog: BlogDocument = new this.blogModel({
      name: name,
      description: description,
      websiteUrl: websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    });

    const createdBlog: BlogDocument = await this.blogsRepository.save(newBlog);

    return {
      status: ResultStatus.Success,
      data: createdBlog.id,
    };
  }
}
