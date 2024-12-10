import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameTypeormRepository } from '../../infrastructure/game/game-typeorm.repository';
import { Player } from '../../domain/player.entity';
import { PlayerTypeormRepository } from '../../infrastructure/player/player-typeorm.repository';
import { Game, GameStatus } from '../../domain/game.entity';
import { QuestionsTypeormRepository } from '../../infrastructure/question/questions-typeorm.repository';
import { GameQuestion } from '../../domain/game-questions.entity';
import { GameQuestionTypeormRepository } from '../../infrastructure/game-question/game-question-typeorm.repository';
import { Result } from '../../../../base/types/object-result';

export class CreateConnectionCommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(CreateConnectionCommand)
export class CreateConnectionUseCase
  implements ICommandHandler<CreateConnectionCommand>
{
  constructor(
    private readonly playerTypeormRepository: PlayerTypeormRepository,
    private readonly gameTypeormRepository: GameTypeormRepository,
    private readonly questionsTypeormRepository: QuestionsTypeormRepository,
    private readonly gameQuestionTypeormRepository: GameQuestionTypeormRepository,
  ) {}

  async execute(
    command: CreateConnectionCommand,
  ): Promise<Result<number | null>> {
    const { userId } = command;

    const activeGame: Game | null =
      await this.gameTypeormRepository.checkUserInActiveGame(userId);

    if (activeGame) {
      return Result.forbidden();
    }

    const player: Player = Player.create(userId);

    await this.playerTypeormRepository.save(player);

    const game: Game | null =
      await this.gameTypeormRepository.findPendingGame();

    /**
     * create game or add player to existing game
     */

    if (!game) {
      // console.log('!game');
      const newGame: Game = Game.create(player);
      newGame.firstPlayer = player;
      newGame.status = GameStatus.Pending;
      newGame.pairCreatedDate = new Date();

      await this.gameTypeormRepository.save(newGame);
    } else {
      // console.log('game exists');
      game.secondPlayer = player;
      game.status = GameStatus.Active;
      game.startGameDate = new Date();

      await this.gameTypeormRepository.save(game);

      await this.createRandomGameQuestions(game.id);
    }

    return Result.success(player.id);
  }

  async createRandomGameQuestions(gameId: number) {
    /**
     * get five random question ids like [ 1084, 1082, 1085, 1079, 1083 ]
     */
    const questionsIds: number[] =
      await this.questionsTypeormRepository.getFiveRandomQuestionIds();

    /**
     * create gameQuestions using questionsIds for gameId
     */

    for (const questionId of questionsIds) {
      const gameQuestion: GameQuestion = GameQuestion.create(
        gameId,
        questionId,
      );

      await this.gameQuestionTypeormRepository.save(gameQuestion);
    }
  }
}
