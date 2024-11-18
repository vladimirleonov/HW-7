import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { GameQuestion } from './game-questions.entity';

export enum GameStatus {
  Pending = 'Pending',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Player, { nullable: false })
  @JoinColumn()
  firstPlayer: Player;

  @OneToOne(() => Player, { nullable: true })
  @JoinColumn()
  secondPlayer: Player | null;

  @OneToMany(() => GameQuestion, (gq) => gq.game, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  questions: GameQuestion[] | null;

  @Column({ type: 'enum', enum: GameStatus, default: GameStatus.Pending })
  status: GameStatus | null;

  // nullable: true - allows to save empty value
  @Column({ type: 'timestamptz', nullable: true, default: null })
  pairCreatedDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  startGameDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  finishGameDate: Date | null;

  static create(firstPlayer: Player): Game {
    const newGame: Game = new Game();

    if (firstPlayer) {
      newGame.firstPlayer = firstPlayer;
    }

    // newGame.status = GameStatus.Pending;
    return newGame;
  }
}
