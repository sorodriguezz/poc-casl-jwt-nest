import { RoleEntity } from 'src/rbac/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: false })
  isAdmin!: boolean;

  @ManyToMany(() => RoleEntity, (role) => role.users, { eager: true })
  @JoinTable({ name: 'user_roles' })
  roles!: RoleEntity[];
}
