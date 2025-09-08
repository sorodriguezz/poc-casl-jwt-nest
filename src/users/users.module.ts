import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PermissionEntity } from '../rbac/permission.entity';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PermissionsGuard } from '../guards/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PermissionEntity])],
  controllers: [UsersController],
  providers: [UsersService, CaslAbilityFactory, PermissionsGuard],
  exports: [TypeOrmModule],
})
export class UsersModule {}
