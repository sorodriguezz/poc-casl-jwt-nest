import {
  AbilityBuilder,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

export enum Actions {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// Entidad de dominio "lógica" (no TypeORM)
export class User {
  id!: number;
  isAdmin!: boolean;
  roles!: string[];
}

export type Subjects = InferSubjects<typeof User> | 'all';
export type AppAbility = MongoAbility<[Actions, Subjects]>;

type BaseRule = {
  action: string;
  subject: string;
  conditions?: any;
  inverted?: boolean;
  reason: string;
};

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User, baseRules: BaseRule[] = []): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    // 1) Reglas que vienen desde BD (roles → permisos)
    for (const r of baseRules) {
      const fn = r.inverted ? cannot : can;
      fn(r.action as any, r.subject as any, r.conditions ?? undefined)?.because(
        r.reason,
      );
    }

    // 2) Reglas por flags
    if (user.isAdmin) {
      can(Actions.Manage, 'all');
    } else {
      can(Actions.Read, 'all');
      cannot(Actions.Delete, User).because(
        'Solo administradores pueden eliminar usuarios',
      );
    }

    return build({
      detectSubjectType: (subj) =>
        subj.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
