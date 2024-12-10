import { AnswerStatus } from '../../../domain/answer.entity';
import { GameStatus } from '../../../domain/game.entity';

export class GameOutputModel {
  id: string;
  firstPlayerProgress: PlayerProgressModel;
  secondPlayerProgress: PlayerProgressModel | null;
  questions: QuestionModel[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
}

class PlayerProgressModel {
  answers: AnswerModel[];
  player: PlayerModel;
  score: number;
}

class AnswerModel {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
}

class PlayerModel {
  id: string;
  login: string;
}

export class QuestionModel {
  id: string;
  body: string;
}
