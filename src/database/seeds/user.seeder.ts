import type { DataSource } from 'typeorm'
import type { Seeder } from 'typeorm-extension'

import { User, UserRole } from '../../user/entities/index.ts'
import { hashPassword } from '../../user/password.js'

const DEFAULT_PASSWORD = 'Bibliotech123'

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

export class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const password = await hashPassword(
      process.env.SEED_USER_PASSWORD ?? DEFAULT_PASSWORD,
    )

    const users = await dataSource
      .getRepository(User)
      .save(USERS.map((user) => ({ ...user, password })))

    console.log(`Seeded ${users.length} users`)
  }
}
