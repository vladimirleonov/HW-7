import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Question } from '../../domain/question.entity';

export class QuestionsTypeormRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async save(question: Question): Promise<void> {
    await this.questionRepository.save(question);
  }

  async getOne(id: number): Promise<Question | null> {
    return this.questionRepository.findOneBy({ id });
  }

  async getFiveRandomQuestionIds(): Promise<number[]> {
    const questions = await this.questionRepository
      .createQueryBuilder('q')
      .orderBy('RANDOM()')
      .limit(5)
      .getMany();

    return questions.map((question) => question.id);
  }

  async delete(id: number): Promise<boolean> {
    const result: DeleteResult = await this.questionRepository.softDelete(id);

    return result.affected === 1;
  }
}
