import { Not, Repository } from 'typeorm';
import { Player, PlayerStatus } from '../../domain/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatisticOutputModel } from '../../api/models/output/my-statistic.output.model';
import customRound from '../../../../core/utils/custom-round';

export class PlayerTypeormQueryRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerQueryRepository: Repository<Player>,
  ) {}

  async getMyStatistic(userId: number): Promise<UserStatisticOutputModel> {
    const players: Player[] = await this.playerQueryRepository.find({
      where: { userId, status: Not(PlayerStatus.InProgress) },
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
      sumScore: customRound(sumScore),
      avgScores: customRound(avgScore),
      gamesCount: customRound(gamesCount),
      winsCount: customRound(winsCount),
      lossesCount: customRound(lossesCount),
      drawsCount: customRound(drawsCount),
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
