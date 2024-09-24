import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsPostgresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // async save(blog: BlogDocument): Promise<BlogDocument> {
  //   return blog.save();
  // }
  //
  // async findById(id: string): Promise<BlogDocument | null> {
  //   return this.blogModel.findById(id);
  // }
  //
  // async delete(id: string): Promise<boolean> {
  //   const result = await this.blogModel.deleteOne({ _id: id });
  //
  //   return result.deletedCount === 1;
  // }
}
