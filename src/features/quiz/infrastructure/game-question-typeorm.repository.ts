import { GameQuestion } from '../domain/game-questions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class GameQuestionTypeormRepository {
  constructor(
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
  ) {}

  async save(gameQuestion: GameQuestion): Promise<void> {
    await this.gameQuestionRepository.save(gameQuestion);
  }
}
