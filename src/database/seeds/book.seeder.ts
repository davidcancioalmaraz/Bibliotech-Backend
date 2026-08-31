import type { DataSource } from 'typeorm'
import type { Seeder, SeederFactoryManager } from 'typeorm-extension'

import { Book } from '../../book/entities/index.ts'

const DEFAULT_BOOK_COUNT = 25

export class BookSeeder implements Seeder {
  public async run(
    _dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const count = Number(process.env.SEED_BOOK_COUNT ?? DEFAULT_BOOK_COUNT)

    const books = await factoryManager.get(Book).saveMany(count)

    console.log(`Seeded ${books.length} books`)
  }
}
