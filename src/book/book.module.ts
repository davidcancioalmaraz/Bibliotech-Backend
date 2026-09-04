import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { BookService } from './book.service.js'
import { BookController } from './book.controller.js'
import { Loan } from '../loan/entities/index.js'
import { Book } from './entities/index.js'

@Module({
  imports: [TypeOrmModule.forFeature([Book, Loan])],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
