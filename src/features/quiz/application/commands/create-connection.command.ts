import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameTypeormRepository } from '../../infrastructure/game-typeorm.repository';
import { Player } from '../../domain/player.entity';
import { PlayerTypeormRepository } from '../../infrastructure/player-typeorm.repository';
import { Game, GameStatus } from '../../domain/game.entity';
import { QuestionsTypeormRepository } from '../../infrastructure/questions-typeorm.repository';
import { GameQuestion } from '../../domain/game-questions.entity';
import { GameQuestionTypeormRepository } from '../../infrastructure/game-question-typeorm.tepository';
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

  async execute(command: CreateConnectionCommand) {
    const { userId } = command;

    const activeGame: Game | null =
      await this.gameTypeormRepository.checkUserInActiveGame(userId);

    if (activeGame) {
      return Result.forbidden();
    }

    const player: Player = Player.create(userId);
    // console.log(player);
    // console.log(player.id);
    // Player { userId: 1 }

    await this.playerTypeormRepository.save(player);

    const game: Game | null =
      await this.gameTypeormRepository.findPendingGame();

    if (!game) {
      console.log('!game');
      const game1: Game = Game.create(player);
      game1.firstPlayer = player;
      game1.status = GameStatus.Pending;
      game1.pairCreatedDate = new Date();
      console.log(game1);

      await this.gameTypeormRepository.save(game1);
    } else {
      console.log('game exists');
      game.secondPlayer = player;
      game.status = GameStatus.Active;
      // game.pairCreatedDate = new Date();
      game.startGameDate = new Date();

      console.log(game);

      await this.gameTypeormRepository.save(game);

      try {
        await this.createRandomGameQuestions(game.id);
      } catch (err) {
        console.log('createRandomGameQuestions err', err);
      }
    }

    return Result.success(player.id);
  }

  async createRandomGameQuestions(gameId: number) {
    const questionsIds: number[] =
      await this.questionsTypeormRepository.getFiveRandomQuestionIds();

    console.log('questionsIds', questionsIds);
    // [ 1084, 1082, 1085, 1079, 1083 ]

    questionsIds.forEach((questionId) => {
      const gameQuestion: GameQuestion = GameQuestion.create(
        gameId,
        questionId,
      );
      console.log(gameQuestion);

      this.gameQuestionTypeormRepository.save(gameQuestion);
    });
  }
}
