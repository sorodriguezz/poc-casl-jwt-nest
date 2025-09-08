import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  action!: string; // 'manage' | 'read' | 'create' | 'update' | 'delete'

  @Column()
  subject!: string; // 'all' | 'User' | 'Post' | etc.

  @Column({ type: 'text', nullable: true })
  conditions?: string | null; // JSON string, e.g. {"id":"${user.id}"}

  @Column({ default: false })
  inverted!: boolean; // true => cannot

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @ManyToOne(() => RoleEntity, (role) => role.permissions, {
    onDelete: 'CASCADE',
  })
  role!: RoleEntity;
}
