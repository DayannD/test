import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRoles } from '../../common/enums/user-roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  @Index('idx_user_email')
  email: string;

  @Column({ unique: true, length: 20 })
  @Index('idx_user_phone')
  phone: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified: boolean;

  @Column('simple-array', { default: UserRoles.USER })
  roles: string[];

  @Column('simple-array', { name: 'refresh_tokens', default: '' })
  @Exclude()
  refreshTokens: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<User> = {}) {
    Object.assign(this, partial);
  }
}
