import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Blog } from '../domain/blog.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
  ) {}

  // async create(
  //   name: string,
  //   description: string,
  //   websiteUrl: string,
  // ): Promise<Result<string>> {
  //   // TODO: how to create correctly ???
  //   const newBlog: BlogDocument = new this.blogModel({
  //     name: name,
  //     description: description,
  //     websiteUrl: websiteUrl,
  //     createdAt: new Date(),
  //     isMembership: false,
  //   });
  //
  //   const createdBlog: BlogDocument = await this.blogsRepository.save(newBlog);
  //
  //   return Result.success(createdBlog.id);
  // }

  // async update(
  //   id: string,
  //   name: string,
  //   description: string,
  //   websiteUrl: string,
  // ): Promise<Result> {
  //   const blog: BlogDocument | null = await this.blogsRepository.findById(id);
  //
  //   if (!blog) {
  //     return Result.notFound(`Blog with id ${id} could not be found`);
  //   }
  //
  //   blog.name = name;
  //   blog.description = description;
  //   blog.websiteUrl = websiteUrl;
  //
  //   await this.blogsRepository.save(blog);
  //
  //   return Result.success();
  // }

  // async delete(id: string): Promise<Result> {
  //   const isDeleted: boolean = await this.blogsRepository.delete(id);
  //   if (isDeleted) {
  //     return Result.success();
  //   } else {
  //     return Result.notFound(
  //       `Blog with id ${id} could not be found or deleted`,
  //     );
  //   }
  // }
}
