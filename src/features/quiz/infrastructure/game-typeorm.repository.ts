import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../domain/game.entity';
import { Repository } from 'typeorm';

export class GameTypeormRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async save(game: Game): Promise<void> {
    await this.gameRepository.save(game);
  }

  async findPendingGame(): Promise<Game | null> {
    return this.gameRepository.findOneBy({ status: GameStatus.Pending });
  }
}
