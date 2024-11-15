import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Answer } from './answer.entity';
import { Game } from './game.entity';

enum PlayerStatus {
  Win = 'Win',
  Los = 'Los',
  Draft = 'Draft',
}

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => User, (u) => u.players)
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @OneToOne(() => Game)
  @JoinColumn()
  game: Game;

  @Column()
  gameId: number;

  @OneToMany(() => Answer, (a) => a.player)
  answers: Answer[];

  @Column()
  score: number;

  @Column()
  status: PlayerStatus;

  // auto set on create
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
