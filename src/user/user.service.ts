import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateUserDto } from './dto/create-user.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { hashPassword } from './utils/password.ts'
import { User } from './entities/index.ts'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.save(
      this.userRepository.create({
        ...createUserDto,
        password: await hashPassword(createUserDto.password),
      }),
    )

    // `save` devuelve la entidad en memoria, con el hash incluido; la columna
    // es `select: false` justamente para no exponerlo.
    return this.findOne(user.id)
  }

  findAll() {
    return this.userRepository.find()
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id })
  }

  findByEmailWithPassword(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne()
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password)
    }

    return this.userRepository.update(id, updateUserDto)
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id)
    if (result.affected === 0)
      throw new NotFoundException(`User ${id} not found`)
  }
}
