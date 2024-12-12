import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../../domain/game.entity';
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
      .where('g.status IN (:...statuses)', {
        statuses: [GameStatus.Active, GameStatus.Pending],
      })
      .andWhere('(fp.userId = :userId OR sp.userId = :userId)', {
        userId: userId,
      })
      .getOne();

    return game;
  }

  async getUserActiveGame(userId: number): Promise<Game | null> {
    const game: Game | null = await this.gameRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.firstPlayer', 'fp')
      .leftJoinAndSelect('g.secondPlayer', 'sp')
      .leftJoin('fp.user', 'fpu')
      .leftJoin('sp.user', 'spu')
      .leftJoinAndMapMany('g.questions', 'g.questions', 'gq')
      .where('g.status IN (:...statuses)', {
        statuses: [GameStatus.Active],
        //statuses: [GameStatus.Active, GameStatus.Pending],
      })
      .andWhere('(fp.userId = :userId OR sp.userId = :userId)', {
        userId: userId,
      })
      .orderBy('gq.id')
      .getOne();

    return game;
  }
}
