import { DataSource } from 'typeorm'
import { runSeeders } from 'typeorm-extension'

import { Book } from '../book/entities/index.ts'
import { dataSourceOptions } from './data-source.js'
import { bookFactory } from './seeds/book.factory.js'
import { faker } from './seeds/faker.js'
import { BookSeeder } from './seeds/book.seeder.js'

const dataSource = new DataSource({
  ...dataSourceOptions,
  entities: [Book],
  migrationsRun: false,
})

await dataSource.initialize()

try {
  if (process.env.SEED_FAKER_SEED) {
    faker.seed(Number(process.env.SEED_FAKER_SEED))
  }

  if (process.env.SEED_FRESH === 'true') {
    const { tableName } = dataSource.getRepository(Book).metadata
    await dataSource.query(
      `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`,
    )
    console.log(`Table "${tableName}" truncated`)
  }

  await runSeeders(dataSource, {
    seeds: [BookSeeder],
    factories: [bookFactory],
  })
} finally {
  await dataSource.destroy()
}
