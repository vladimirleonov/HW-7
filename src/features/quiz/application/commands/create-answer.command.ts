import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlayerTypeormRepository } from '../../infrastructure/player/player-typeorm.repository';
import { Result } from '../../../../base/types/object-result';
import { GameTypeormRepository } from '../../infrastructure/game/game-typeorm.repository';
import { Game, GameStatus } from '../../domain/game.entity';
import { Player, PlayerStatus } from '../../domain/player.entity';
import { AnswerTypeormRepository } from '../../infrastructure/answer/answer-typeorm.repository';
import { Answer, AnswerStatus } from '../../domain/answer.entity';
import { GameQuestion } from '../../domain/game-questions.entity';
import { Question } from '../../domain/question.entity';
import { QuestionsTypeormRepository } from '../../infrastructure/question/questions-typeorm.repository';

export class CreateAnswerCommand {
  constructor(
    public readonly userId: number,
    public readonly answer: string,
  ) {}
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase
  implements ICommandHandler<CreateAnswerCommand>
{
  constructor(
    private readonly playerTypeormRepository: PlayerTypeormRepository,
    private readonly gameTypeormRepository: GameTypeormRepository,
    private readonly questionsTypeormRepository: QuestionsTypeormRepository,
    private readonly answerTypeormRepository: AnswerTypeormRepository,
  ) {}

  async execute(command: CreateAnswerCommand): Promise<Result<number | null>> {
    const { userId, answer } = command;

    /**
     * get user active game
     */

    const activeGame: Game | null =
      await this.gameTypeormRepository.getUserActiveGame(userId);

    if (!activeGame) {
      return Result.forbidden();
    }

    /**
     * validate player in progress by userId
     */

    const player: Player | null =
      await this.playerTypeormRepository.getOneInProgress(userId);

    if (!player) {
      return Result.forbidden();
    }

    /**
     * get next not answered question and its number
     */

    const [nextGameQuestion, questionNumber]: [
      GameQuestion | null,
      number | null,
    ] = await this.findNextQuestion(activeGame, player);

    if (!nextGameQuestion || questionNumber === null) {
      return Result.forbidden();
    }

    /**
     * check if answer correct to the question
     */

    const isCorrect: boolean = await this.checkIsAnswerCorrect(
      nextGameQuestion,
      answer,
    );

    /**
     * create answer
     */

    const answerId: number = await this.createAnswer(
      nextGameQuestion,
      player,
      isCorrect,
    );

    /**
     * recalculate player score
     */

    await this.recalculatePlayerScore(
      player,
      isCorrect,
      questionNumber,
      activeGame,
    );

    await this.changePayerAndGameStatus(activeGame);

    return Result.success(answerId);
  }

  async findNextQuestion(
    activeGame: Game,
    player: Player,
  ): Promise<[GameQuestion | null, number | null]> {
    const gameQuestions: GameQuestion[] = activeGame.questions || [];

    const existingAnswers: Answer[] | null =
      await this.answerTypeormRepository.getAllByPlayerId(player.id);

    /**
     * get answered question ids from existingAnswers
     */

    const answeredQuestionIds: Set<number> = new Set(
      (existingAnswers || []).map((a) => a.questionId),
    );

    /**
     * check in queue if there is an answer in answeredQuestionIds by gq.questionId
     * if no - this number of question is next
     */

    let questionNumber: number = 0;

    for (const gq of gameQuestions) {
      questionNumber++;
      if (!answeredQuestionIds.has(gq.questionId)) {
        return [gq, questionNumber];
      }
    }

    return [null, null];
  }

  async checkIsAnswerCorrect(
    gameQuestion: GameQuestion,
    answer: string,
  ): Promise<boolean> {
    /**
     * 1) get question from db by gameQuestion.questionId
     * 2) get correctAnswers from question
     * 3) compare with passed answer
     * 4) return bool result
     */

    const questionId: number = gameQuestion.questionId;

    const question: Question | null =
      await this.questionsTypeormRepository.getOne(questionId);

    if (!question) {
      return false;
    }

    const correctAnswers: string[] = question.correctAnswers;

    for (const element of correctAnswers) {
      if (element === answer) {
        return true;
      }
    }

    return false;
  }

  async createAnswer(
    nextGameQuestion: GameQuestion,
    player: Player,
    isCorrect: boolean,
  ): Promise<number> {
    /**
     * 1) get questionId from nextGameQuestion.questionId
     * 2) create isAnswerCorrect with status from AnswerStatus using AnswerStatus enum
     * 3) create answer
     * 4) return answerId
     */

    const questionId: number = nextGameQuestion.questionId;
    const isAnswerCorrect: AnswerStatus = isCorrect
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;

    const playerId: number = player.id;

    const answer: Answer = Answer.create(playerId, questionId, isAnswerCorrect);

    await this.answerTypeormRepository.save(answer);

    return answer.id;
  }

  async recalculatePlayerScore(
    player: Player,
    isCorrect: boolean,
    questionNumber: number,
    activeGame: Game,
  ): Promise<void> {
    /**
     * get current player from activeGame by playerId
     * change its score
     */

    const currentPlayer: Player | null =
      activeGame.firstPlayer.id === player.id
        ? activeGame.firstPlayer
        : activeGame.secondPlayer;

    if (isCorrect) {
      currentPlayer!.score += 1;
    }

    /**
     * if last answer - add 1 score if observed conditions
     */

    if (questionNumber === 5) {
      /**
       * get first player correct answers
       */

      // const playerCorrectAnswers: Answer[] | null =
      //   (await this.answerTypeormRepository.getAllCorrectByPlayerId(
      //     currentPlayer!.id,
      //   )) || [];

      /**
       * get second player to get then his answers
       */

      const secondPlayer =
        activeGame.firstPlayer.userId === currentPlayer!.userId
          ? activeGame.secondPlayer
          : activeGame.firstPlayer;

      /**
       * get second player answers
       */

      const secondPlayerAnswers: Answer[] =
        (await this.answerTypeormRepository.getAllByPlayerId(
          secondPlayer!.id,
        )) || [];

      /**
       * check there if second player answered 5 questions until now (already answered 5)
       * and there is at least one correct
       * then score += 1
       */

      const secondPlayerCorrectAnswers: Answer[] =
        (await this.answerTypeormRepository.getAllCorrectByPlayerId(
          secondPlayer!.id,
        )) || [];

      if (
        secondPlayerAnswers.length === 5 &&
        secondPlayerCorrectAnswers.length > 0
      ) {
        secondPlayer!.score += 1;
      }

      await this.playerTypeormRepository.save(secondPlayer!);
    }

    await this.playerTypeormRepository.save(currentPlayer!);
  }

  async changePayerAndGameStatus(activeGame: Game) {
    const firstPlayer: Player = activeGame.firstPlayer;
    const secondPlayer: Player = activeGame.secondPlayer!;

    const firstPlayerId: number = firstPlayer.id;
    const secondPlayerId: number = secondPlayer.id;

    const firstPlayerAnswers: Answer[] | null =
      await this.answerTypeormRepository.getAllByPlayerId(firstPlayerId);

    /**
     * check if fifth first player answer
     */

    if (firstPlayerAnswers?.length !== 5) {
      return;
    }

    /**
     * check if fifth second player answer
     */

    const secondPlayerAnswers: Answer[] | null =
      await this.answerTypeormRepository.getAllByPlayerId(secondPlayerId);

    if (secondPlayerAnswers?.length !== 5) {
      return;
    }

    if (firstPlayer.score > secondPlayer.score) {
      firstPlayer.status = PlayerStatus.Win;
      secondPlayer.status = PlayerStatus.Los;
    } else if (firstPlayer.score < secondPlayer.score) {
      firstPlayer.status = PlayerStatus.Los;
      secondPlayer.status = PlayerStatus.Win;
    } else {
      firstPlayer.status = PlayerStatus.Draw;
      secondPlayer.status = PlayerStatus.Draw;
    }

    activeGame.finishGameDate = new Date();
    activeGame.status = GameStatus.Finished;

    await this.playerTypeormRepository.save(firstPlayer);
    await this.playerTypeormRepository.save(secondPlayer);
    await this.gameTypeormRepository.save(activeGame);
  }
}
