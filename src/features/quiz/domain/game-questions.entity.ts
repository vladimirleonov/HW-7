import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
export class GameQuestions {
  @PrimaryColumn()
  gameId: number;

  @PrimaryColumn()
  questionId: number;

  @ManyToOne(() => Game)
  game: Game;

  @ManyToOne(() => Question)
  question: Question;
}
