import { setSeederFactory } from 'typeorm-extension'

import { User, UserRole } from '../../user/entities/user.entity.js'
import { faker } from './faker.js'

/** `Nadia Sanchís` → `nadia.sanchis`: no accents, no spaces, nothing to escape. */
const slugify = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, '.')

/**
 * Generates a library member. Only members: the fixed admin in `UserSeeder` is
 * the one account that needs stable credentials, and everyone here exists to
 * give the loan history more than three names to draw from.
 *
 * `password` is left to the seeder on purpose — bcrypt is deliberately slow, so
 * hashing once and sharing the digest keeps a hundred users cheap to seed.
 */
export const userFactory = setSeederFactory(User, () => {
  const user = new User()

  const name = `${faker.person.firstName()} ${faker.person.lastName()}`

  user.name = name
  // The suffix is what keeps `users.email` unique: faker v10 dropped
  // `helpers.unique`, and over a long run plain names do repeat.
  user.email = `${slugify(name)}.${faker.string.alphanumeric({
    length: 4,
    casing: 'lower',
  })}@bibliotech.test`
  user.role = UserRole.MEMBER
  // A few inactive accounts, so the rule that stops them borrowing has
  // something to reject after a plain reseed.
  user.isActive = faker.helpers.weightedArrayElement([
    { weight: 9, value: true },
    { weight: 1, value: false },
  ])

  return user
})
