import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PaginationQueryDto, paginate } from '../common/index.js'
import { CreateUserDto } from './dto/create-user.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { hashPassword } from './utils/password.js'
import { User } from './entities/index.js'

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

    // `save` returns the in-memory entity, hash included; the column is
    // `select: false` precisely so it never ships.
    return this.findOne(user.id)
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.userRepository, query, { order: { id: 'ASC' } })
  }

  async findOne(id: number) {
    const user = await this.findById(id)
    if (!user) throw new NotFoundException(`User ${id} not found`)

    return user
  }

  /**
   * Non-throwing lookup for `JwtStrategy`, which turns an unknown user into a
   * 401, not the 404 `findOne` would raise.
   */
  findById(id: number) {
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
    const user = await this.findOne(id)

    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password)
    }

    await this.userRepository.save(Object.assign(user, updateUserDto))

    // Re-read for the same reason as in `create`: the saved entity carries the
    // hash in memory, and it must not travel in the response.
    return this.findOne(id)
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id)
    if (result.affected === 0)
      throw new NotFoundException(`User ${id} not found`)
  }
}
