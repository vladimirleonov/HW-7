import { Repository } from 'typeorm';
import { Player, PlayerStatus } from '../../domain/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MyStatisticOutputModel } from '../../api/models/output/my-statistic.output.model';

export class PlayerTypeormQueryRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerQueryRepository: Repository<Player>,
  ) {}

  async getMyStatistic(userId: number): Promise<MyStatisticOutputModel> {
    const players: Player[] = await this.playerQueryRepository.find({
      where: { userId },
    });

    const sumScore: number = players.reduce(
      (acc: number, player: Player) => acc + player.score,
      0,
    );
    const avgScore: number = sumScore / players.length;
    const gamesCount: number = players.length;
    const winsCount: number = players.filter(
      (player: Player): boolean => player.status === PlayerStatus.Win,
    ).length;
    const lossesCount: number = players.filter(
      (player: Player): boolean => player.status === PlayerStatus.Lose,
    ).length;
    const drawsCount: number = players.filter(
      (player: Player): boolean => player.status === PlayerStatus.Draw,
    ).length;

    return {
      sumScore,
      avgScore,
      gamesCount,
      winsCount,
      lossesCount,
      drawsCount,
    };
  }

  async checkPlayerExistsById(playerId: number): Promise<boolean> {
    const player: Player | null = await this.playerQueryRepository.findOneBy({
      id: playerId,
    });

    return !!player;
  }

  async checkActivePlayerExistsByUserId(userId: number): Promise<boolean> {
    const player: Player | null = await this.playerQueryRepository.findOneBy({
      userId: userId,
      status: PlayerStatus.InProgress,
    });

    return !!player;
  }
}
