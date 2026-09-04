import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PaginationQueryDto, paginate } from '../common/index.js'
import { Loan } from '../loan/entities/index.js'
import { CreateUserDto } from './dto/create-user.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { hashPassword } from './utils/password.js'
import { User } from './entities/index.js'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // Read-only here, and only to count: an account cannot be dropped while the
    // lending history still points at it.
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.assertEmailIsFree(createUserDto.email)

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

    // Only when the address actually moves: re-sending the user's own email
    // would otherwise collide with the row being updated.
    if (updateUserDto.email && updateUserDto.email !== user.email)
      await this.assertEmailIsFree(updateUserDto.email)

    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password)
    }

    await this.userRepository.save(Object.assign(user, updateUserDto))

    // Re-read for the same reason as in `create`: the saved entity carries the
    // hash in memory, and it must not travel in the response.
    return this.findOne(id)
  }

  async remove(id: number) {
    // The foreign key is `ON DELETE NO ACTION`, so any loan — open or returned
    // — blocks the delete. Cascading instead would erase the lending history to
    // make the request succeed, and an account is not worth that trade; an
    // account that should stop borrowing is deactivated, not deleted.
    const loans = await this.loanRepository.countBy({ userId: id })
    if (loans > 0)
      throw new ConflictException(
        `User ${id} has ${loans} loan(s) recorded against them and cannot be deleted`,
      )

    const result = await this.userRepository.delete(id)
    if (result.affected === 0)
      throw new NotFoundException(`User ${id} not found`)
  }

  /**
   * Reads before writing so the answer can name the field, which the unique
   * index on `users.email` cannot do on its own. The index still has the last
   * word: two simultaneous requests both pass this check and `QueryFailedFilter`
   * turns the loser into the same 409.
   */
  private async assertEmailIsFree(email: string) {
    if (await this.userRepository.existsBy({ email }))
      throw new ConflictException(`Email ${email} is already registered`)
  }
}
