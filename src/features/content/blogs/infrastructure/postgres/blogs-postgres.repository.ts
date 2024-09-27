import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogOutputModelMapper } from '../../api/models/output/blog.output.model';

@Injectable()
export class BlogsPostgresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // async save(blog: BlogDocument): Promise<BlogDocument> {
  //   return blog.save();
  // }

  async create(
    name: string,
    description: string,
    websiteUrl: string,
    isMembership: boolean,
  ) {
    const query: string = `
      INSERT INTO blogs
      (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    console.log('query', query);

    const result = await this.dataSource.query(query, [
      name,
      description,
      websiteUrl,
      isMembership,
    ]);

    const createdId: number = result[0].id;

    return createdId;
  }

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
