import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PasswordRecovery {
  @PrimaryColumn()
  userId: number;

  @OneToOne(() => User, (u) => u.passwordRecovery)
  @JoinColumn()
  user: User;

  @Column({ type: 'uuid' })
  recoveryCode: string;

  @Column({ type: 'timestamptz' })
  expirationDate: Date;
}
