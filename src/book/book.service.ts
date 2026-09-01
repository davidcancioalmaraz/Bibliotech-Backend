import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PaginationQueryDto, paginate } from '../common/index.js'
import { CreateBookDto } from './dto/create-book.dto.js'
import { UpdateBookDto } from './dto/update-book.dto.js'
import { Book } from './entities/index.js'

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  create(createBookDto: CreateBookDto) {
    return this.bookRepository.save(this.bookRepository.create(createBookDto))
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.bookRepository, query, { order: { id: 'ASC' } })
  }

  async findOne(id: number) {
    const book = await this.bookRepository.findOneBy({ id })
    if (!book) throw new NotFoundException(`Book ${id} not found`)

    return book
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const book = await this.findOne(id)

    return this.bookRepository.save(Object.assign(book, updateBookDto))
  }

  async remove(id: number) {
    const result = await this.bookRepository.delete(id)
    if (result.affected === 0)
      throw new NotFoundException(`Book ${id} not found`)
  }
}
