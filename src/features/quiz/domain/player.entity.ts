import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Answer } from './answer.entity';

export enum PlayerStatus {
  Win = 'Win',
  Lose = 'Lose',
  InProgress = 'InProgress',
  Draw = 'Draw',
}

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  // @OneToOne(() => Game)
  // @JoinColumn()
  // game: Game;

  // @Column()
  // gameId: number;

  // by default not
  @OneToMany(() => Answer, (a) => a.player)
  answers: Answer[];

  @Column({ default: 0 })
  score: number;

  @Column({
    type: 'enum',
    enum: PlayerStatus,
    default: PlayerStatus.InProgress,
  })
  status: PlayerStatus;

  // auto set on create
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  static create(userId: number) {
    const newPlayer: Player = new this();
    //newPlayer.id = userId;
    newPlayer.userId = userId;
    return newPlayer;
  }
}
