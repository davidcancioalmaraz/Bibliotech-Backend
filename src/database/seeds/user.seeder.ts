import type { DataSource } from 'typeorm'
import type { Seeder, SeederFactoryManager } from 'typeorm-extension'

import { User, UserRole } from '../../user/entities/index.ts'
import { hashPassword } from '../../user/utils/password.ts'

const DEFAULT_PASSWORD = 'Bibliotech123'
const DEFAULT_USER_COUNT = 10

const USERS = [
  {
    name: 'Lucía Bermejo',
    email: 'admin@bibliotech.test',
    role: UserRole.ADMIN,
  },
  {
    name: 'Marcos Iriarte',
    email: 'marcos@bibliotech.test',
    role: UserRole.MEMBER,
  },
  {
    name: 'Nadia Sanchís',
    email: 'nadia@bibliotech.test',
    role: UserRole.MEMBER,
  },
]

/**
 * Three fixed accounts plus a handful of generated members.
 *
 * The fixed ones keep their credentials stable across reseeds, which is what
 * makes the login examples in the README work; the generated ones exist so the
 * loan history is spread over enough borrowers to be worth paging through.
 */
export class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    // Hashed once and shared: bcrypt is deliberately slow, and every seeded
    // account is meant to be logged into with the same password anyway.
    const password = await hashPassword(
      process.env.SEED_USER_PASSWORD ?? DEFAULT_PASSWORD,
    )

    const count = Number(process.env.SEED_USER_COUNT ?? DEFAULT_USER_COUNT)

    // `make` yields one at a time — the factory has no `makeMany`, which is why
    // `LoanSeeder` loops over it too.
    const factory = factoryManager.get(User)
    const generated: User[] = []

    for (let i = 0; i < count; i++) generated.push(await factory.make())

    const users = await dataSource
      .getRepository(User)
      .save([...USERS, ...generated].map((user) => ({ ...user, password })))

    console.log(
      `Seeded ${users.length} users (${USERS.length} fixed, ${generated.length} generated)`,
    )
  }
}
