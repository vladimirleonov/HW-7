import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Answer } from './answer.entity';

enum PlayerStatus {
  Win = 'Win',
  Los = 'Los',
  InProgress = 'InProgress',
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

  // @OneToOne(() => Game)
  // @JoinColumn()
  // game: Game;
  //
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

  // auto set when soft delete
  // @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  // deletedAt: Date | null;

  static create(userId: number) {
    const newPlayer: Player = new this();
    newPlayer.userId = userId;
    return newPlayer;
  }
}
