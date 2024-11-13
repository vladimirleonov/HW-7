import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Question } from '../domain/question.entity';

export class QuestionsTypeormRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async save(question: Question): Promise<void> {
    await this.questionRepository.save(question);
  }

  async findOne(id: number): Promise<Question | null> {
    return this.questionRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<boolean> {
    const result: DeleteResult = await this.questionRepository.delete(id);

    return result.affected === 1;
  }
}
