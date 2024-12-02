import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer, AnswerStatus } from '../domain/answer.entity';

export class AnswerTypeormRepository {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  async save(answer: Answer): Promise<void> {
    await this.answerRepository.save(answer);
  }

  async getAllByPlayerId(playerId: number): Promise<Answer[]> {
    return this.answerRepository.find({
      where: { playerId },
      select: ['questionId'],
    });
  }

  async getAllCorrectByPlayerId(playerId: number): Promise<Answer[]> {
    return this.answerRepository.find({
      where: { playerId, status: AnswerStatus.Correct },
      select: ['questionId'],
    });
  }
}
