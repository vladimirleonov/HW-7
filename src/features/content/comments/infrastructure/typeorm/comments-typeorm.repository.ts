import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Comment } from '../../domain/comment.entity';

@Injectable()
export class CommentsTypeormRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async save(comment: Comment): Promise<void> {
    await this.commentRepository.save(comment);
  }

  async findById(id: number): Promise<Comment | null> {
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
