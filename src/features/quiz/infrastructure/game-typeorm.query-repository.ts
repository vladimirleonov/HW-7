import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../domain/game.entity';
import { Repository } from 'typeorm';
import { Player } from '../domain/player.entity';
import { Answer } from '../domain/answer.entity';
import { GameQuestion } from '../domain/game-questions.entity';
import { query } from 'express';

export class GameTypeormQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameQueryRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
  ) {}

  async getOne(gameId: number): Promise<Game | null> {
    const game = await this.gameQueryRepository
      .createQueryBuilder('g')
      .select([
        'CAST(g.id as text) as id',
        'g.status as status',
        'g.pairCreatedDate as "pairCreatedDate"',
        'g.startGameDate as "startGameDate"',
        'g.finishGameDate as "finishGameDate"',
      ])
      .addSelect(
        `
        json_build_object (
          'player', json_build_object(
            'id', CAST(fp.userId as text),
            'login', fpu.login
          ),
          -- join not used
          'answers', COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'questionId', CAST(fpa.question_id as text),
                  'answerStatus', fpa.status,
                  'addedAt', fpa.created_at AT TIME ZONE 'UTC'
                )
              )
              FROM answer fpa
              WHERE fpa.player_id = fp.id
            ),
            '[]'
          ),
          'score', fp.score
        ) as "firstPlayerProgress"
      `,
      )
      .addSelect(
        `
        CASE 
          WHEN sp.id IS NOT NULL THEN json_build_object (
            'player', json_build_object(
              'id', CAST(sp.userId as text),
              'login', spu.login
            ),
            -- join not used
            'answers', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'questionId', CAST(spa.question_id as text),
                    'answerStatus', spa.status,
                    'addedAt', spa.created_at AT TIME ZONE 'UTC'
                  )
                )
                FROM answer spa
                WHERE spa.player_id = sp.id
              ),
              '[]'
            ),
            'score', sp.score
          )
          ELSE NULL
        END as "secondPlayerProgress"
      `,
      )
      .addSelect(
        `
        CASE 
          WHEN COUNT(q.id) > 0 THEN 
            json_agg(
              json_build_object(
                'id', CAST(q.id as text),
                'body', q.body
              ) ORDER BY q.id
            )
          ELSE null
        END
      `,
        'questions',
      )
      .leftJoin('g.firstPlayer', 'fp')
      .leftJoin('g.secondPlayer', 'sp')
      .leftJoin('fp.user', 'fpu')
      .leftJoin('sp.user', 'spu')
      .leftJoin('g.questions', 'gq')
      .leftJoin('gq.question', 'q')
      .where('g.id = :gameId', { gameId: gameId })
      .groupBy(
        'g.id, g.status, g.pairCreatedDate, g.startGameDate, g.finishGameDate, fp.id, fpu.login, sp.id, spu.login',
      ) // add GROUP BY as use json_agg (all except used in json_agg)
      .getRawOne();

    return game;
  }

  async getCurrentUnfinishedUserGame(userId: number): Promise<Game | null> {
    // rewrite using .leftJoin('g.questions', 'q')
    const questions = this.gameQuestionRepository
      .createQueryBuilder('gq')
      .select(
        `
          json_agg(
            json_build_object(
              'id', CAST(q.id as text), 
              'body', q.body
            ) ORDER BY q.id
          )
        `,
      )
      .leftJoin('gq.question', 'q')
      .where('gq.gameId = g.id'); // connect with game query

    const game = await this.gameQueryRepository
      .createQueryBuilder('g')
      .select([
        'CAST(g.id as text) as id',
        'g.status as status',
        'g.pairCreatedDate as "pairCreatedDate"',
        'g.startGameDate as "startGameDate"',
        'g.finishGameDate as "finishGameDate"',
      ])
      .addSelect(
        `
          json_build_object(
            'player', json_build_object(
              'id', CAST(fp.userId as text),
              'login', fpu.login
            ),
            -- join not used
            'answers', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'questionId', CAST(fpa.question_id as text),
                    'answerStatus', fpa.status,
                    'addedAt', fpa.created_at AT TIME ZONE 'UTC'
                  )
                )
                FROM answer fpa
                WHERE fpa.player_id = fp.id
              ),
              '[]'
            ),
            'score', fp.score
          ) as "firstPlayerProgress"
        `,
      )
      .addSelect(
        `
          CASE
            WHEN sp.id IS NOT NULL THEN json_build_object(
              'player', json_build_object(
                'id', CAST(sp.userId as text),
                'login', spu.login
              ),
              -- join not used
              'answers', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'questionId', CAST(spa.question_id as text),
                    'answerStatus', spa.status,
                    'addedAt', spa.created_at AT TIME ZONE 'UTC'
                  )
                )
                FROM answer spa
                WHERE spa.player_id = sp.id
              ),
              '[]'
            ),
            'score', sp.score
            )
            ELSE NULL
          END as "secondPlayerProgress"
        `,
      )
      .addSelect(
        `
          (${questions.getQuery()})
        `,
        'questions',
      )
      .leftJoin('g.firstPlayer', 'fp')
      .leftJoin('g.secondPlayer', 'sp')
      .leftJoin('fp.user', 'fpu')
      .leftJoin('sp.user', 'spu')
      .where(
        'g.status IN (:...statuses)  AND (fpu.id = :userId OR spu.id = :userId)',
        {
          statuses: [GameStatus.Pending, GameStatus.Active],
          userId: userId,
        },
      )
      // .andWhere('fpu.id = :userId OR spu.id = :userId ', { userId: userId })
      .getRawOne();

    return game;
  }

  async getPlayerPendingOrJoinedGame(playerId: number): Promise<Game | null> {
    const questions = this.gameQuestionRepository
      .createQueryBuilder('gq')
      .select(
        `
          json_agg(
            json_build_object(
              'id', CAST(q.id as text),
             'body', q.body
            ) ORDER BY q.id
          )
          `,
      )
      .leftJoin('gq.question', 'q')
      .where('gq.gameId = g.id'); // connect with game query

    const game = await this.gameQueryRepository
      .createQueryBuilder('g')
      .select([
        'CAST(g.id as text) as id',
        'g.status as status',
        'g.pairCreatedDate as "pairCreatedDate"',
        'g.startGameDate as "startGameDate"',
        'g.finishGameDate as "finishGameDate"',
      ])
      .addSelect(
        `
          json_build_object(
            'player', json_build_object(
              'id', CAST(fp.userId as text),
              'login', fpu.login
            ),
            -- join not used
            'answers', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'questionId', CAST(fpa.question_id as text),
                    'answerStatus', fpa.status,
                    'addedAt', fpa.created_at AT TIME ZONE 'UTC'
                  )
                )
                FROM answer fpa
                WHERE fpa.player_id = fp.id
              ),
              '[]'
            ),
            'score', fp.score
          ) as "firstPlayerProgress"
        `,
      )
      .addSelect(
        `
          CASE 
            WHEN sp.id IS NOT NULL THEN json_build_object(
              'player', json_build_object(
                'id', CAST(sp.userId as text),
                'login', spu.login
              ),
              -- join not used
              'answers', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'questionId', CAST(spa.question_id as text),
                    'answerStatus', spa.status,
                    'addedAt', spa.created_at AT TIME ZONE 'UTC'
                  )
                )
                FROM answer spa
                WHERE spa.player_id = sp.id
              ),
              '[]'
            ),
            'score', sp.score
            )
            ELSE NULL
          END as "secondPlayerProgress" 
        `,
      )
      .addSelect(
        `
          (${questions.getQuery()})
        `,
        'questions',
      )
      .leftJoin('g.firstPlayer', 'fp')
      .leftJoin('g.secondPlayer', 'sp')
      .leftJoin('fp.user', 'fpu')
      .leftJoin('sp.user', 'spu')
      .where('fp.id = :playerId OR sp.id = :playerId', { playerId: playerId })
      .getRawOne();

    return game;
  }

  async checkUserParticipation(gameId, userId) {
    const game = await this.gameQueryRepository
      .createQueryBuilder('g')
      .leftJoin('g.firstPlayer', 'fp')
      .leftJoin('g.secondPlayer', 'sp')
      .where('g.id = :gameId', { gameId: gameId })
      .andWhere('(fp.userId = :userId OR sp.userId = :userId)', {
        userId: userId,
      })
      .getRawOne();

    return !!game;
  }

  async gameExists(gameId: number): Promise<boolean> {
    const game: Game | null = await this.gameQueryRepository
      .createQueryBuilder('g')
      .where('g.id = :gameId', { gameId: gameId })
      .getOne();

    return !!game;
  }
}
