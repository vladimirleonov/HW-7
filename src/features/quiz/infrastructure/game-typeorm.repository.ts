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
    return this.gameRepository.findOneBy({
      status: GameStatus.Pending,
    });
  }

  async checkUserInActiveGame(userId: number): Promise<Game | null> {
    const game: Game | null = await this.gameRepository
      .createQueryBuilder('g')
      .leftJoin('g.firstPlayer', 'fp')
      .leftJoin('g.secondPlayer', 'sp')
      .where('fp.userId = :userId OR sp.userId = :userId', { userId: userId })
      .andWhere('g.status IN (:...statuses)', {
        statuses: [GameStatus.Active, GameStatus.Pending],
      })
      .getOne();

    return game;
  }
}
