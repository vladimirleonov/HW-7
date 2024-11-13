import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';

export class QuestionsTypeormRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async save(question: Question): Promise<void> {
    await this.questionRepository.save(question);
  }
}