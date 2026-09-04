import { setSeederFactory } from 'typeorm-extension'

import { Book, BookStatus } from '../../book/entities/book.entity.js'
import { faker } from './faker.js'
import { descriptionTemplates } from './locale/es-libros.js'

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

export const bookFactory = setSeederFactory(Book, () => {
  const book = new Book()

  book.title = capitalize(faker.helpers.fake(faker.book.title()))
  book.description = faker.helpers.fake(
    faker.helpers.arrayElement(descriptionTemplates),
  )
  book.isbn = faker.commerce.isbn()
  book.code = `BT-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`
  book.author = `${faker.person.firstName()} ${faker.person.lastName()}`
  book.category = faker.book.genre()
  book.year = faker.date.past({ years: 60 }).getFullYear()
  book.publisher = faker.helpers.fake(faker.book.publisher())
  book.language = 'es'
  book.pages = faker.number.int({ min: 80, max: 1200 })
  book.status = faker.helpers.weightedArrayElement([
    { weight: 7, value: BookStatus.AVAILABLE },
    { weight: 2, value: BookStatus.ON_LOAN },
    { weight: 1, value: BookStatus.UNDER_REPAIR },
  ])

  return book
})
