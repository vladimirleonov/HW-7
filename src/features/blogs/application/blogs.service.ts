import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { Model } from 'mongoose';
import { Result, ResultStatus } from '../../../../base/types/object-result';
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
  async update(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<Result<boolean>> {
    const blog: BlogDocument | null = await this.blogsRepository.findById(id);
    if (!blog) {
      return {
        status: ResultStatus.NotFound,
        extensions: [
          {
            field: 'id',
            message: `Blog with id ${id} could not be found or updated`,
          },
        ],
        data: false,
      };
    }

    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;

    await this.blogsRepository.save(blog);

    return {
      status: ResultStatus.Success,
      data: true,
    };
  }
  async delete(id: string): Promise<Result<boolean>> {
    const isDeleted: boolean = await this.blogsRepository.delete(id);
    console.log(isDeleted);
    if (isDeleted) {
      return {
        status: ResultStatus.Success,
        data: true,
      };
    } else {
      return {
        status: ResultStatus.NotFound,
        extensions: [
          {
            field: 'id',
            message: `Blog with id ${id} could not be found or deleted`,
          },
        ],
        data: false,
      };
    }
  }
}
