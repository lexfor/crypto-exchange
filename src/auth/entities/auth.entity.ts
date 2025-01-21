import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';

export enum Role {
  USER = 'user',
}

@Entity()
@Unique('idx_user_email', ['email'])
export class AuthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column('text', { default: [Role.USER], array: true })
  roles: string[];

  @Column({ nullable: true })
  refreshToken: string;

  @OneToOne(() => UsersEntity, (user) => user.auth)
  @JoinColumn()
  user: UsersEntity;
}
