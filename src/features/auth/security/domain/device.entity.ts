import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../users/domain/user.entity';

@Entity()
export class Device {
  @PrimaryColumn({ type: 'uuid' })
  deviceId: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  deviceName: string;

  @Column()
  ip: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  iat: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  exp: Date;
}
