import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
export class GameQuestion {
  @PrimaryColumn()
  gameId: number;

  @PrimaryColumn()
  questionId: number;

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  game: Game;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  question: Question;

  static create(gameId: number, questionId: number) {
    const gameQuestion: GameQuestion = new this();

    gameQuestion.gameId = gameId;
    gameQuestion.questionId = questionId;

    return gameQuestion;
  }
}
