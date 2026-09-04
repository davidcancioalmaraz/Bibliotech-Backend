import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'

import { PaginationQueryDto, paginate } from '../common/index.js'
import { Loan } from '../loan/entities/index.js'
import { CreateBookDto } from './dto/create-book.dto.js'
import { UpdateBookDto } from './dto/update-book.dto.js'
import { Book, BookStatus } from './entities/index.js'

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    // Read-only here, and only about this book: the catalogue needs to know
    // whether a copy is out before it lets anyone change its status or delete it.
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async create(createBookDto: CreateBookDto) {
    await this.assertCodeIsFree(createBookDto.code)

    if (createBookDto.status === BookStatus.ON_LOAN)
      throw new BadRequestException(
        'A new book cannot start as on-loan; lend it through POST /loans',
      )

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

    if (updateBookDto.code && updateBookDto.code !== book.code)
      await this.assertCodeIsFree(updateBookDto.code)

    if (updateBookDto.status && updateBookDto.status !== book.status)
      await this.assertStatusChangeIsAllowed(book, updateBookDto.status)

    return this.bookRepository.save(Object.assign(book, updateBookDto))
  }

  async remove(id: number) {
    // The foreign key is `ON DELETE NO ACTION`, so any loan — open or returned
    // — blocks the delete. Cascading instead would erase the lending history to
    // make the request succeed, which is not a trade the catalogue should make.
    const loans = await this.loanRepository.countBy({ bookId: id })
    if (loans > 0)
      throw new ConflictException(
        `Book ${id} has ${loans} loan(s) recorded against it and cannot be deleted`,
      )

    const result = await this.bookRepository.delete(id)
    if (result.affected === 0)
      throw new NotFoundException(`Book ${id} not found`)
  }

  /**
   * Reads before writing so the answer can name the field. The unique index on
   * `books.code` still has the last word, through `QueryFailedFilter`.
   */
  private async assertCodeIsFree(code: string) {
    if (await this.bookRepository.existsBy({ code }))
      throw new ConflictException(`Book code ${code} is already taken`)
  }

  /**
   * `on-loan` is not an editorial detail, it is the other half of the invariant
   * `LoanService` maintains: a book in that state has exactly one loan with
   * `returnedAt = null`. Letting the catalogue set or clear it by hand would
   * strand that loan and let the same copy be lent twice, so only
   * `available ↔ under-repair` is a change this endpoint can make.
   */
  private async assertStatusChangeIsAllowed(book: Book, status: BookStatus) {
    if (
      await this.loanRepository.existsBy({
        bookId: book.id,
        returnedAt: IsNull(),
      })
    )
      throw new ConflictException(
        `Book ${book.id} has an open loan; return it before changing its status`,
      )

    if (status === BookStatus.ON_LOAN)
      throw new ConflictException(
        `Book ${book.id} only becomes on-loan by lending it through POST /loans`,
      )
  }
}
