import { Faker, base, es } from '@faker-js/faker'

import { esLibros } from './locale/es-libros.js'

/**
 * Instancia de faker usada por los seeders, en español.
 *
 * `en` queda deliberadamente fuera de la cadena de locales: si un módulo no
 * tiene datos en `esLibros`, `es` ni `base`, faker lanza un error en vez de
 * devolver texto en inglés en silencio.
 */
export const faker = new Faker({ locale: [esLibros, es, base] })
