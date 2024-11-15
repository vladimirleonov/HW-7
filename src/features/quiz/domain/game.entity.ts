import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';

enum GameStatus {
  Pending = 'Pending',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Player)
  firstPlayer: Player | null;

  @OneToOne(() => Player)
  secondPlayer: Player | null;

  @Column({ enum: GameStatus, default: GameStatus.Pending })
  status: GameStatus;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  pairCreatedDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  startGameDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  finishGameDate: Date | null;
}
