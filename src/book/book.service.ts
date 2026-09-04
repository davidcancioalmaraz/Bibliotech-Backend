import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateBookDto } from './dto/create-book.dto.js'
import { UpdateBookDto } from './dto/update-book.dto.js'
import { Book } from './entities/index.ts'

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  create(createBookDto: CreateBookDto) {
    return this.bookRepository.save(this.bookRepository.create(createBookDto))
  }

  findAll() {
    return this.bookRepository.find()
  }

  findOne(id: number) {
    return this.bookRepository.findOneBy({ id })
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return this.bookRepository.update(id, updateBookDto)
  }

  async remove(id: number) {
    const result = await this.bookRepository.delete(id)
    if (result.affected === 0)
      throw new NotFoundException(`User ${id} not found`)
  }
}
