import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateBookDto } from './dto/create-book.dto.js'
import { UpdateBookDto } from './dto/update-book.dto.js'
import { Book } from './entities/book.entity.js'

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  create(createBookDto: CreateBookDto) {
    return 'This action adds a new book'
  }

  findAll() {
    return `This action returns all book`
  }

  findOne(id: number) {
    return `This action returns a #${id} book`
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`
  }

  remove(id: number) {
    return `This action removes a #${id} book`
  }
}
