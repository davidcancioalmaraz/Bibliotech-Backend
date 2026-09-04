import type { DataSource } from 'typeorm'
import type { Seeder, SeederFactoryManager } from 'typeorm-extension'

import { Book, BookStatus } from '../../book/entities/index.ts'
import { Loan } from '../../loan/entities/index.ts'
import { faker } from './faker.js'
import { fecharAbierto, fecharDevuelto, hoy } from './loan.factory.js'

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

    const maxPerBook = Number(
      process.env.SEED_LOAN_MAX_PER_BOOK ?? DEFAULT_MAX_LOANS_PER_BOOK,
    )
    const factory = factoryManager.get(Loan)
    const loans: Loan[] = []

    for (const book of books) {
      // El historial se construye hacia atrás desde el préstamo vivo (o desde
      // hoy), así que ningún ejemplar acaba prestado dos veces a la vez.
      let corte = hoy()

      // Un libro prestado tiene exactamente un préstamo sin devolver.
      if (book.status === BookStatus.ON_LOAN) {
        const abierto = fecharAbierto(await factory.make())
        abierto.bookId = book.id
        loans.push(abierto)
        corte = abierto.loanedAt
      }

      const historico = faker.number.int({ min: 0, max: maxPerBook })

      for (let i = 0; i < historico; i++) {
        const loan = fecharDevuelto(await factory.make(), corte)
        loan.bookId = book.id
        loans.push(loan)
        corte = loan.loanedAt
      }
    }

    await dataSource.getRepository(Loan).save(loans)

    const abiertos = loans.filter((loan) => loan.returnedAt === null).length
    console.log(`Seeded ${loans.length} loans (${abiertos} still open)`)
  }
}
