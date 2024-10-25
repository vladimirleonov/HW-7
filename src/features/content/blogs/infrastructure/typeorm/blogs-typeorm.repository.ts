import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Blog } from '../../domain/blog.entity';

@Injectable()
export class BlogsTypeormRepository {
  constructor(
    //@InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
  ) {}

  // +
  async findById(id: number): Promise<any> {
    // Blog | null
    return this.blogsRepository.findOneBy({
      id: id,
    });
  }

  // +
  async create(
    name: string,
    description: string,
    websiteUrl: string,
    isMembership: boolean,
  ) {
    const newBlog: Blog = this.blogsRepository.create({
      name,
      description,
      websiteUrl,
      isMembership,
      // createdAt: new Date(),
    });

    // console.log(newBlog);

    const createdBlog: Blog = await this.blogsRepository.save(newBlog);

    const blogId: number = createdBlog.id;

    return blogId;

    // const query: string = `
    //   INSERT INTO blog
    //   (name, description, website_url, is_membership)
    //   VALUES ($1, $2, $3, $4)
    //   RETURNING id;
    // `;
    //
    // const result = await this.dataSource.query(query, [
    //   name,
    //   description,
    //   websiteUrl,
    //   isMembership,
    // ]);
    //
    // const createdId: number = result[0].id;
    //
    // return createdId;
  }

  // +
  async update(
    id: number,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const result: UpdateResult = await this.blogsRepository.update(id, {
      name,
      description,
      websiteUrl,
    });

    return result.affected === 1;
  }

  async delete(id: number): Promise<boolean> {
    const result: DeleteResult = await this.blogsRepository.delete(id);

    return result.affected === 1;

    // const query: string = `
    //   DELETE FROM blogs
    //   WHERE id = $1
    // `;
    //
    // const result = await this.dataSource.query(query, [id]);
    //
    // const deletedCount = result[1];
    //
    // return deletedCount === 1;
  }
}
