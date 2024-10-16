import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PasswordRecovery {
  @PrimaryColumn()
  userId: number;

  // makes userId as foreign key
  @OneToOne(() => User, (u) => u.passwordRecovery, { onDelete: 'CASCADE' })
  @JoinColumn() // adds foreign key (user + id (primary key) => userId)
  user: User;

  @Column({ type: 'uuid' })
  recoveryCode: string;

  @Column({ type: 'timestamptz' })
  expirationDate: Date;
}
