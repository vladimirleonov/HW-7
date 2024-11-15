import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Question } from './question.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, (p) => p.answers)
  @JoinColumn()
  player: Player;

  @Column()
  PlayerId: number;

  @OneToOne(() => Question)
  @JoinColumn()
  question: Question;

  @Column()
  questionId: number;

  @Column({ nullable: true })
  status: string;

  // auto set on create
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
