import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Index('idx_confirmation_code_expiration_data', [
  'confirmationCode',
  'expirationDate',
])
export class EmailConfirmation {
  @PrimaryColumn()
  userId: number;

  // makes userId as foreign key
  @OneToOne(() => User, (u) => u.emailConfirmation, { onDelete: 'CASCADE' })
  @JoinColumn() // adds foreign key
  user: User;

  @Column({ type: 'uuid' })
  // @Index('idx_user_confirmation_code')
  confirmationCode: string;

  @Column({ type: 'timestamptz' })
  expirationDate: Date;

  @Column({ default: false })
  isConfirmed: boolean;
}
