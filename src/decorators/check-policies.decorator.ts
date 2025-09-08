import { SetMetadata } from '@nestjs/common';
import { AppAbility } from '../casl/casl-ability.factory';

export const CHECK_POLICIES_KEY = 'checkPolicies';
export type PolicyHandler = (ability: AppAbility) => boolean;

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
