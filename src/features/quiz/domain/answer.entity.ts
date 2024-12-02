import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Question } from './question.entity';

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, (p) => p.answers, { onDelete: 'CASCADE' })
  @JoinColumn()
  player: Player;

  @Column()
  playerId: number;

  @ManyToOne(() => Question)
  @JoinColumn()
  question: Question;

  @Column()
  questionId: number;

  @Column({
    type: 'enum',
    enum: AnswerStatus,
    default: AnswerStatus.Incorrect,
  })
  status: AnswerStatus;

  // auto set on create
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  static create(playerId: number, questionId: number, status: AnswerStatus) {
    const newAnswer: Answer = new this();
    newAnswer.playerId = playerId;
    newAnswer.questionId = questionId;
    newAnswer.status = status;

    return newAnswer;
  }
}
