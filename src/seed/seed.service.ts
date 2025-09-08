import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../users/user.entity';
import { RoleEntity } from '../rbac/role.entity';
import { PermissionEntity } from '../rbac/permission.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly perms: Repository<PermissionEntity>,
  ) {}

  async onModuleInit() {
    const countUsers = await this.users.count();
    if (countUsers > 0) return;

    const adminRole = this.roles.create({ name: 'admin' });
    const userRole = this.roles.create({ name: 'user' });
    await this.roles.save([adminRole, userRole]);

    // permisos:
    const p1 = this.perms.create({
      action: 'manage',
      subject: 'all',
      role: adminRole,
    });
    const p2 = this.perms.create({
      action: 'read',
      subject: 'all',
      role: userRole,
    });
    await this.perms.save([p1, p2]);

    // usuarios con contraseñas hash:
    const admin = this.users.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      isAdmin: true,
      roles: [adminRole],
    });

    const regular = this.users.create({
      name: 'Regular User',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('user123', 10),
      isAdmin: false,
      roles: [userRole],
    });

    await this.users.save([admin, regular]);
  }
}
