import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './rbac/permission.entity';
import { SeedService } from './seed/seed.service';
import { UserEntity } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RoleEntity } from './rbac/role.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: config.get<string>('DB_PATH', 'nest-casl.sqlite'),
        entities: [UserEntity, RoleEntity, PermissionEntity],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, RoleEntity, PermissionEntity]),
    UsersModule,
    AuthModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
