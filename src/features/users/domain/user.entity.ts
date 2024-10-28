import {
  Check,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmation } from './email-confirmation';
import { PasswordRecovery } from './password-recovery';

// TODO: validation in entity should be the same as in api?
// TODO: Check or length better use

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, collation: 'C' })
  @Check(`length(login) >= 3`)
  //@Check(`length(login) >= 3 AND length(login) <= 10`)
  login: string;

  @Column({ length: 60 })
  @Check(`length(password) >= 6`)
  password: string;

  @Column({ collation: 'C' })
  email: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => EmailConfirmation, (ec) => ec.user, { onDelete: 'CASCADE' })
  emailConfirmation: EmailConfirmation;

  @OneToOne(() => PasswordRecovery, (pr) => pr.user, { onDelete: 'CASCADE' })
  passwordRecovery: PasswordRecovery;
}
