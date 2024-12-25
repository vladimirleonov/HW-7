import { Not, Repository } from 'typeorm';
import { Player, PlayerStatus } from '../../domain/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatisticOutputModel } from '../../api/models/output/my-statistic.output.model';
import customRound from '../../../../core/utils/custom-round';
import {
  PaginationOutput,
  PaginationWithScores,
} from '../../../../base/models/pagination.base.model';
import { MultiSortQueryParams } from '../../../../base/models/pagination-query.input.model';
import { TopUserOutputModel } from '../../api/models/output/top-user.output.model';

export class PlayerTypeormQueryRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerQueryRepository: Repository<Player>,
  ) {}

  async getTopUsers(
    pagination: PaginationWithScores<MultiSortQueryParams>,
  ): Promise<any> {
    const query = this.playerQueryRepository
      .createQueryBuilder('p')
      .select([
        'CAST(SUM(p.score) as INTEGER) as "sumScore"',
        `CASE 
          WHEN ROUND(AVG(p.score), 2) = FLOOR(AVG(p.score)) THEN ROUND(AVG(p.score), 0)::DOUBLE PRECISION
          ELSE ROUND(AVG(p.score), 2)::DOUBLE PRECISION
        END AS "avgScores"
        `,
        'CAST(COUNT(p.id) as INTEGER) as "gamesCount"',
        `CAST(COUNT(CASE WHEN p.status = '${PlayerStatus.Win}' THEN 1 END) as INTEGER) as "winsCount"`,
        `CAST(COUNT(CASE WHEN p.status = '${PlayerStatus.Lose}' THEN 1 END) as INTEGER) as "lossesCount"`,
        `CAST(COUNT(CASE WHEN p.status = '${PlayerStatus.Draw}' THEN 1 END) as INTEGER) as "drawsCount"`,
        `json_build_object(
          'id', CAST(u.id as varchar), 
          'login', u.login
        ) as player`,
      ])
      .leftJoin('p.user', 'u')
      .groupBy('u.id')
      .offset(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    for (const sortItem of pagination.sort) {
      // will be avgScores not avgscores in addOrderBy
      query.addOrderBy(`"${sortItem.field}"`, sortItem.direction);
    }

    const users: TopUserOutputModel[] = await query.getRawMany();

    // count = all string count not grouped by
    // const totalCount: number = await query.getCount();

    const totalCountQuery = this.playerQueryRepository
      .createQueryBuilder('p')
      .select('CAST(COUNT(DISTINCT u.id) as INTEGER)') // count unique
      .leftJoin('p.user', 'u');

    const totalCount: number = await totalCountQuery
      .getRawOne()
      .then((result) => result.count);

    return new PaginationOutput<TopUserOutputModel>(
      users,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

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
}
