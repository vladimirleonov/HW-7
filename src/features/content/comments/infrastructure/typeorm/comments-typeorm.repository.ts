import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Comment } from '../../domain/comment.entity';

@Injectable()
export class CommentsTypeormRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async save(comment: Comment) {
    await this.commentRepository.save(comment);
  }

  async findById(id: number): Promise<any> {
    // Comment | null
    return this.commentRepository.findOneBy({ id });
  }

  async update(id: number, content: string): Promise<boolean> {
    const result: UpdateResult = await this.commentRepository.update(
      { id },
      { content },
    );

    return result.affected === 1;
  }

  async delete(id: number): Promise<boolean> {
    const result: DeleteResult = await this.commentRepository.delete({ id });

    return result.affected === 1;
  }
}
