import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { UserEntity } from 'src/users/user.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string; // 'admin', 'user', etc.

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users!: UserEntity[];

  @OneToMany(() => PermissionEntity, (perm) => perm.role, {
    cascade: true,
    eager: true,
  })
  permissions!: PermissionEntity[];
}
