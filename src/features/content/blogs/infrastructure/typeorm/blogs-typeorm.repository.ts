import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogOutputModelMapper } from '../../api/models/output/blog.output.model';

@Injectable()
export class BlogsTypeormRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findById(id: number): Promise<any> {
    const query: string = `
      SELECT * FROM blogs
      WHERE id = $1
    `;

    const result = await this.dataSource.query(query, [id]);

    return result.length > 0 ? BlogOutputModelMapper(result[0]) : null;
  }

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

    const result = await this.dataSource.query(query, [
      name,
      description,
      websiteUrl,
      isMembership,
    ]);

    const createdId: number = result[0].id;

    return createdId;
  }

  async update(
    id: number,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const query: string = `
      UPDATE blogs
      SET name = $1, description = $2, website_url = $3
      WHERE id = $4
    `;

    const result = await this.dataSource.query(query, [
      name,
      description,
      websiteUrl,
      id,
    ]);

    const updatedCount = result[1];

    return updatedCount === 1;
  }

  async delete(id: number): Promise<boolean> {
    const query: string = `
      DELETE FROM blogs
      WHERE id = $1
    `;

    const result = await this.dataSource.query(query, [id]);

    const deletedCount = result[1];

    return deletedCount === 1;
  }
}
