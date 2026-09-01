import { Faker, base, es } from '@faker-js/faker'

import { esLibros } from './locale/es-libros.js'

/**
 * The faker instance the seeders use, in Spanish.
 *
 * `en` is deliberately left out of the locale chain: if a module has no data in
 * `esLibros`, `es` or `base`, faker throws instead of quietly falling back to
 * English text.
 */
export const faker = new Faker({ locale: [esLibros, es, base] })
