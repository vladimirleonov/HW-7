import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../../users/domain/user.entity';

@Entity()
@Index(['iat', 'deviceId'])
@Index(['userId', 'deviceId'])
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

  static create(
    deviceId: string,
    userId: number,
    deviceName: string,
    ip: string,
    iat: string,
    exp: string,
  ): Device {
    const newDevice: Device = new Device();
    newDevice.deviceId = deviceId;
    newDevice.userId = userId;
    newDevice.deviceName = deviceName;
    newDevice.ip = ip;
    newDevice.iat = new Date(iat);
    newDevice.exp = new Date(exp);

    return newDevice;
  }
}
