import { DataSource } from 'typeorm'
import { runSeeders } from 'typeorm-extension'

import { Book } from '../book/entities/index.ts'
import { Loan } from '../loan/entities/index.ts'
import { dataSourceOptions } from './data-source.js'
import { bookFactory } from './seeds/book.factory.js'
import { faker } from './seeds/faker.js'
import { loanFactory } from './seeds/loan.factory.js'
import { BookSeeder } from './seeds/book.seeder.js'
import { LoanSeeder } from './seeds/loan.seeder.js'

const dataSource = new DataSource({
  ...dataSourceOptions,
  entities: [Book, Loan],
  migrationsRun: false,
})

await dataSource.initialize()

try {
  if (process.env.SEED_FAKER_SEED) {
    faker.seed(Number(process.env.SEED_FAKER_SEED))
  }

  if (process.env.SEED_FRESH === 'true') {
    const tables = [Loan, Book].map(
      (entity) => dataSource.getRepository(entity).metadata.tableName,
    )
    await dataSource.query(
      `TRUNCATE TABLE ${tables.map((table) => `"${table}"`).join(', ')} RESTART IDENTITY CASCADE`,
    )
    console.log(`Tables ${tables.join(', ')} truncated`)
  }

  await runSeeders(dataSource, {
    seeds: [BookSeeder, LoanSeeder],
    factories: [bookFactory, loanFactory],
  })
} finally {
  await dataSource.destroy()
}
