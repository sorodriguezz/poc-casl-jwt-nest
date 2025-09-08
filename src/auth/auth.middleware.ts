import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { PermissionEntity } from '../rbac/permission.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permsRepo: Repository<PermissionEntity>,
  ) {}

  async use(req: any, _res: any, next: () => void) {
    const id = Number(req.headers['x-user-id'] ?? 2);
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      // fallback: primer usuario
      const first = await this.usersRepo.find({ take: 1 });
      req.user = first[0] ?? null;
    } else {
      req.user = {
        id: user.id,
        isAdmin: user.isAdmin,
        roles: user.roles?.map((r) => r.name) ?? [],
      };
    }

    // Carga permisos agregados por los roles del usuario (flatten)
    const roleIds = (user?.roles ?? []).map((r) => r.id);
    if (roleIds.length > 0) {
      const perms = await this.permsRepo
        .createQueryBuilder('p')
        .leftJoin('p.role', 'r')
        .where('r.id IN (:...roleIds)', { roleIds })
        .getMany();

      req.abilityBaseRules = perms.map((p) => ({
        action: p.action,
        subject: p.subject,
        conditions: p.conditions ? JSON.parse(p.conditions) : undefined,
        inverted: p.inverted,
        reason: p.reason ?? undefined,
      }));
    } else {
      req.abilityBaseRules = [];
    }

    next();
  }
}
