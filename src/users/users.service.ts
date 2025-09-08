import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async create(dto: CreateUserDto) {
    const u = this.repo.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, 10),
      isAdmin: false,
    });
    return this.repo.save(u);
  }

  async remove(id: number) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) return null;
    await this.repo.remove(u);
    return u;
  }
}
