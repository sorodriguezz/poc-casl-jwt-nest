import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CHECK_POLICIES_KEY,
  PolicyHandler,
} from '../decorators/check-policies.decorator';
import {
  CaslAbilityFactory,
  AppAbility,
  User,
} from '../casl/casl-ability.factory';
import { UserEntity } from '../users/user.entity';
import { PermissionEntity } from '../rbac/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslFactory: CaslAbilityFactory,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(PermissionEntity)
    private readonly perms: Repository<PermissionEntity>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const handlers = this.reflector.get<PolicyHandler[]>(
      CHECK_POLICIES_KEY,
      ctx.getHandler(),
    );
    if (!handlers?.length) return true;

    const req = ctx.switchToHttp().getRequest();
    const jwtUser = req?.user as { id: number; email: string } | undefined;
    if (!jwtUser) throw new UnauthorizedException('No autenticado');

    // 1) Rehidratar user completo con roles
    const u = await this.users.findOne({ where: { id: jwtUser.id } });
    if (!u) throw new UnauthorizedException('Usuario no encontrado');

    // 2) Aplanar permisos desde roles del usuario
    const roleIds = (u.roles ?? []).map((r) => r.id);
    let baseRules: Array<{
      action: string;
      subject: string;
      conditions?: any;
      inverted?: boolean;
      reason: string;
    }> = [];

    if (roleIds.length) {
      const dbPerms = await this.perms
        .createQueryBuilder('p')
        .leftJoin('p.role', 'r')
        .where('r.id IN (:...roleIds)', { roleIds })
        .getMany();

      const replacePlaceholders = (s: string) =>
        s.replace(/\$\{user\.([a-zA-Z0-9_]+)\}/g, (_, k) =>
          String((u as any)[k] ?? ''),
        );

      baseRules = dbPerms.map((p) => ({
        action: p.action,
        subject: p.subject,
        conditions: p.conditions
          ? JSON.parse(replacePlaceholders(p.conditions))
          : undefined,
        inverted: p.inverted,
        reason: typeof p.reason === 'string' ? p.reason : '',
      }));
    }

    // 3) Construir Ability final (reglas de BD + globales del factory)
    const domainUser: User = {
      id: u.id,
      isAdmin: u.isAdmin,
      roles: u.roles?.map((r) => r.name) ?? [],
    };
    const ability: AppAbility = this.caslFactory.createForUser(
      domainUser,
      baseRules,
    );

    // 4) Evaluar políticas
    const ok = handlers.every((h) => h(ability));
    if (!ok)
      throw new ForbiddenException(
        'No tienes permiso para realizar esta acción',
      );

    return true;
  }
}
