import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlayerTypeormRepository } from '../../infrastructure/player-typeorm.repository';
import { Result } from '../../../../base/types/object-result';
import { GameTypeormRepository } from '../../infrastructure/game-typeorm.repository';
import { Game, GameStatus } from '../../domain/game.entity';
import { Player, PlayerStatus } from '../../domain/player.entity';
import { AnswerTypeormRepository } from '../../infrastructure/answer-typeorm.repository';
import { Answer, AnswerStatus } from '../../domain/answer.entity';
import { GameQuestion } from '../../domain/game-questions.entity';
import { Question } from '../../domain/question.entity';
import { QuestionsTypeormRepository } from '../../infrastructure/questions-typeorm.repository';

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

  async execute(command: CreateAnswerCommand): Promise<Result<number>> {
    const { userId, answer } = command;

    /**
     * active or pending game with player by userId
     */

    const activeGame: Game | null =
      await this.gameTypeormRepository.getUserActiveGame(userId);
    // console.log('activeGame', activeGame);

    if (!activeGame) {
      return Result.forbidden();
    }

    /**
     * player in progress by userId
     */

    const player: Player | null =
      await this.playerTypeormRepository.getOne(userId);
    // console.log('player', player);

    /**
     * check player in activeGame
     */

    if (
      !player ||
      (activeGame.firstPlayer.userId !== player.userId &&
        activeGame.secondPlayer &&
        activeGame.secondPlayer.userId !== player.userId)
    ) {
      return Result.forbidden();
    }

    /**
     * next not answered question and its number
     */

    const [nextGameQuestion, questionNumber]: [
      GameQuestion | null,
      number | null,
    ] = await this.findNextQuestion(activeGame, player);
    // console.log(
    //   'nextGameQuestion',
    //   nextGameQuestion,
    //   'questionNumber',
    //   questionNumber,
    // );
    // GameQuestion { gameId: 1, questionId: 3 } 2

    if (!nextGameQuestion || questionNumber === null) {
      console.log('!next question');
      return Result.forbidden();
    }

    /**
     * check if answer correct to the question
     */

    const isCorrect: boolean = await this.checkIsAnswerCorrect(
      nextGameQuestion,
      answer,
    );
    console.log('isCorrect', isCorrect);

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
    // const gameQuestions: GameQuestion[] = activeGame.questions || [];
    // const questionNumber: number = 0;

    // for (const gq of gameQuestions) {
    //   questionNumber++;
    //   const existingAnswer: Answer | null =
    //     await this.answerTypeormRepository.getOne(player.id, gq.questionId);
    //
    //   if (!existingAnswer) {
    //     return [gq, questionNumber];
    //   }
    // }

    const gameQuestions: GameQuestion[] = activeGame.questions || [];
    // const questionNumber: number = 0;

    const existingAnswers: Answer[] | null =
      await this.answerTypeormRepository.getAllByPlayerId(player.id);

    // console.log('existingAnswers', existingAnswers);
    // existingAnswers [ Answer { questionId: 1 }, Answer { questionId: 3 } ]

    const answeredQuestionIds = new Set(
      (existingAnswers || []).map((a) => a.questionId),
    );
    // console.log('gameQuestions', gameQuestions);
    // console.log('answeredQuestionIds', answeredQuestionIds);

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
    const questionId: number = gameQuestion.questionId;

    const question: Question | null =
      await this.questionsTypeormRepository.getOne(questionId);

    // TODO
    if (!question) {
      // return Result.forbidden();
      return false;
    }

    const correctAnswers: string[] = question.correctAnswers;
    console.log('correctAnswers', correctAnswers);
    console.log('answer', answer);

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
  ) {
    const playerId: number = player.id;
    const questionId: number = nextGameQuestion.questionId;
    const isAnswerCorrect: AnswerStatus = isCorrect
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;

    console.log('questionId', questionId);
    const answer: Answer = Answer.create(playerId, questionId, isAnswerCorrect);
    // console.log(answer);

    await this.answerTypeormRepository.save(answer);

    return answer.id;
  }

  async recalculatePlayerScore(
    player: Player,
    isCorrect: boolean,
    questionNumber: number,
    activeGame: Game,
  ) {
    console.log('player score 1', player.score);
    if (isCorrect) {
      player.score += 1;
    }
    console.log('player score 2', player.score);

    /**
     * if last answer - add 1 score if observed conditions
     */

    if (questionNumber === 5) {
      console.log('> 5');
      console.log('questionNumber', questionNumber);
      /**
       * get first player correct answers
       */

      const playerCorrectAnswers: Answer[] | null =
        (await this.answerTypeormRepository.getAllCorrectByPlayerId(
          player.id,
        )) || [];
      console.log('playerCorrectAnswers', playerCorrectAnswers);

      /**
       * get second player to get then his answers
       */

      const secondPlayer =
        activeGame.firstPlayer.userId === player.userId
          ? activeGame.secondPlayer
          : activeGame.firstPlayer;
      console.log('secondPlayer', secondPlayer);

      /**
       * get second player answers
       */

      const secondPlayerAnswers: Answer[] =
        (await this.answerTypeormRepository.getAllByPlayerId(
          secondPlayer!.id,
        )) || [];
      console.log('secondPlayerAnswers', secondPlayerAnswers);

      /**
       * check there is at list one first player correct answer and less than five second player answers
       */

      if (playerCorrectAnswers.length > 0 && secondPlayerAnswers.length < 5) {
        console.log('user first answered +1 score!!!');
        player.score += 1;
      }
    }

    console.log('player score 3', player.score);

    await this.playerTypeormRepository.save(player);

    console.log('player score 4', player.score);
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

    console.log('activeGame: users answered 5 questions', activeGame);

    if (firstPlayer.score > secondPlayer.score) {
      firstPlayer.status = PlayerStatus.Win;
      secondPlayer.status = PlayerStatus.Los;
    } else {
      firstPlayer.status = PlayerStatus.Los;
      secondPlayer.status = PlayerStatus.Win;
    }

    activeGame.finishGameDate = new Date();
    activeGame.status = GameStatus.Finished;

    console.log('firstPlayer.status', firstPlayer.status);
    console.log('secondPlayer.status', secondPlayer.status);
    console.log('activeGame.finishGameDate', activeGame.finishGameDate);

    await this.playerTypeormRepository.save(firstPlayer);
    await this.playerTypeormRepository.save(secondPlayer);
    await this.gameTypeormRepository.save(activeGame);
  }
}
