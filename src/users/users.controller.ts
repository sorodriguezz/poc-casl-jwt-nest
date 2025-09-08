import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { CheckPolicies } from '../decorators/check-policies.decorator';
import { Actions, User as DomainUser } from '../casl/casl-ability.factory';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Actions.Create, DomainUser))
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Actions.Read, DomainUser))
  findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Actions.Delete, DomainUser))
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
