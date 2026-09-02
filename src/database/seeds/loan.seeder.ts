import type { DataSource } from 'typeorm'
import type { Seeder, SeederFactoryManager } from 'typeorm-extension'

import { Book, BookStatus } from '../../book/entities/index.js'
import { Loan } from '../../loan/entities/index.js'
import { today } from '../../loan/utils/dates.js'
import { User, UserRole } from '../../user/entities/index.js'
import { faker } from './faker.js'
import { dateAsOpen, dateAsReturned } from './loan.factory.js'

const DEFAULT_MAX_LOANS_PER_BOOK = 3

export class LoanSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const books = await dataSource.getRepository(Book).find()

    if (books.length === 0) {
      console.log('No books to lend, skipping loans')
      return
    }

    // Every loan needs a borrower — `loans.user_id` is NOT NULL — so without
    // members there is nothing to seed. Hence `UserSeeder` runs first.
    const members = await dataSource
      .getRepository(User)
      .findBy({ role: UserRole.MEMBER, isActive: true })

    if (members.length === 0) {
      console.log('No active members to lend to, skipping loans')
      return
    }

    const maxPerBook = Number(
      process.env.SEED_LOAN_MAX_PER_BOOK ?? DEFAULT_MAX_LOANS_PER_BOOK,
    )
    const factory = factoryManager.get(Loan)
    const loans: Loan[] = []

    for (const book of books) {
      // The history is built backwards from the open loan (or from today), so
      // no copy ends up lent twice at the same time.
      let cutoff = today()

      // A lent book has exactly one loan that has not been returned.
      if (book.status === BookStatus.ON_LOAN) {
        const open = dateAsOpen(await factory.make())
        open.bookId = book.id
        open.userId = faker.helpers.arrayElement(members).id
        loans.push(open)
        cutoff = open.loanedAt
      }

      const history = faker.number.int({ min: 0, max: maxPerBook })

      for (let i = 0; i < history; i++) {
        const loan = dateAsReturned(await factory.make(), cutoff)
        loan.bookId = book.id
        loan.userId = faker.helpers.arrayElement(members).id
        loans.push(loan)
        cutoff = loan.loanedAt
      }
    }

    await dataSource.getRepository(Loan).save(loans)

    const stillOpen = loans.filter((loan) => loan.returnedAt === null).length
    console.log(`Seeded ${loans.length} loans (${stillOpen} still open)`)
  }
}
