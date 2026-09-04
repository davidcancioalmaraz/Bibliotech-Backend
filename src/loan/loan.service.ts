import { randomInt } from 'node:crypto'

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, type EntityManager, Repository } from 'typeorm'

import { Book, BookStatus } from '../book/entities/index.js'
import { CreateLoanDto } from './dto/create-loan.dto.js'
import { UpdateLoanDto } from './dto/update-loan.dto.js'
import { Loan } from './entities/index.js'
import {
  DEFAULT_LOAN_TERM_DAYS,
  addDays,
  parseDateOnly,
  toDateOnly,
  today,
} from './utils/dates.js'

const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const CODE_LENGTH = 8
const CODE_ATTEMPTS = 5

/**
 * Lending is governed by one invariant, the same one the seeder respects: a
 * copy can only be in one person's hands at a time, so a book whose status is
 * `on-loan` has exactly one loan with `returnedAt = null`. Every operation
 * that can break that correspondence between `loans.returned_at` and
 * `books.status` runs inside a transaction.
 */
@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly dataSource: DataSource,
  ) {}

  create(createLoanDto: CreateLoanDto) {
    return this.dataSource.transaction(async (manager) => {
      const book = await manager.findOneBy(Book, { id: createLoanDto.bookId })
      if (!book)
        throw new NotFoundException(`Book ${createLoanDto.bookId} not found`)

      if (book.status !== BookStatus.AVAILABLE)
        throw new ConflictException(
          `Book ${book.id} is not available for loan (status: ${book.status})`,
        )

      const loanedAt = createLoanDto.loanedAt
        ? parseDateOnly(createLoanDto.loanedAt)
        : today()

      const loan = manager.create(Loan, {
        code: await this.generateCode(manager),
        bookId: book.id,
        loanedAt,
        dueDate: addDays(
          loanedAt,
          createLoanDto.termDays ?? DEFAULT_LOAN_TERM_DAYS,
        ),
        returnedAt: null,
      })

      book.status = BookStatus.ON_LOAN
      await manager.save(book)
      await manager.save(loan)

      return this.reload(manager, loan.id)
    })
  }

  findAll() {
    return this.loanRepository.find({ order: { loanedAt: 'DESC', id: 'DESC' } })
  }

  async findOne(id: number) {
    const loan = await this.loanRepository.findOneBy({ id })
    if (!loan) throw new NotFoundException(`Loan ${id} not found`)

    return loan
  }

  /** Adjusts the dates of an open loan, which is how an extension is recorded. */
  async update(id: number, updateLoanDto: UpdateLoanDto) {
    const loan = await this.findOne(id)

    if (loan.returnedAt !== null)
      throw new ConflictException(`Loan ${id} is already returned`)

    if (updateLoanDto.loanedAt)
      loan.loanedAt = parseDateOnly(updateLoanDto.loanedAt)

    if (updateLoanDto.termDays)
      loan.dueDate = addDays(toDateOnly(loan.loanedAt), updateLoanDto.termDays)

    await this.loanRepository.save(loan)

    return this.findOne(id)
  }

  /** Closes the loan and puts the copy back on the shelf. */
  async return(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const loan = await manager.findOneBy(Loan, { id })
      if (!loan) throw new NotFoundException(`Loan ${id} not found`)

      if (loan.returnedAt !== null)
        throw new ConflictException(`Loan ${id} is already returned`)

      loan.returnedAt = today()
      await this.releaseBook(manager, loan.bookId)
      await manager.save(loan)

      return this.reload(manager, loan.id)
    })
  }

  async remove(id: number) {
    await this.dataSource.transaction(async (manager) => {
      const loan = await manager.findOneBy(Loan, { id })
      if (!loan) throw new NotFoundException(`Loan ${id} not found`)

      // Deleting an open loan would otherwise leave the copy stuck in
      // `on-loan`, blocked by a loan that no longer exists.
      if (loan.returnedAt === null) await this.releaseBook(manager, loan.bookId)

      await manager.delete(Loan, id)
    })
  }

  /**
   * Re-reads a just-saved loan so the response carries the `YYYY-MM-DD` shape
   * the driver returns for `date` columns. The saved entity still holds the
   * in-memory `Date`, which would serialise as a full timestamp and make the
   * same field look different depending on the endpoint that answered.
   */
  private async reload(manager: EntityManager, id: number) {
    return manager.findOneByOrFail(Loan, { id })
  }

  private async releaseBook(manager: EntityManager, bookId: number) {
    await manager.update(Book, bookId, { status: BookStatus.AVAILABLE })
  }

  /**
   * Same `LN-XXXXXXXX` shape the seeder uses. Collisions are vanishingly rare
   * in a 36^8 space, but the column is unique, so a clash would surface as a
   * 500 rather than a retry.
   */
  private async generateCode(manager: EntityManager) {
    for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
      const code = `LN-${Array.from(
        { length: CODE_LENGTH },
        () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)],
      ).join('')}`

      if (!(await manager.existsBy(Loan, { code }))) return code
    }

    throw new ConflictException('Could not generate a unique loan code')
  }
}
