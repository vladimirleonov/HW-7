import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EmailConfirmation {
  @PrimaryColumn()
  userId: number;

  // makes userId as foreign key
  @OneToOne(() => User, (u) => u.emailConfirmation)
  @JoinColumn() // adds foreign key
  user: User;

  @Column({ type: 'uuid' })
  confirmationCode: string;

  @Column({ type: 'timestamptz' })
  expirationDate: Date;

  @Column({ default: false })
  isConfirmed: boolean;
}
