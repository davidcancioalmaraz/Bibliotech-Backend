import type { LocaleDefinition } from '@faker-js/faker'

/**
 * Custom locale layer holding the Spanish book vocabulary.
 *
 * Faker's official `es` locale defines neither `book` nor `word`, so without
 * this layer `faker.book.*` falls back to English. It is mounted as the first
 * layer of the `[esLibros, es, base]` chain in `book.factory.ts`.
 *
 * The nouns are all masculine and the adjectives are in masculine singular, so
 * the templates agree in gender with no exceptions.
 */

const sustantivos = [
  'silencio',
  'jardín',
  'espejo',
  'río',
  'viaje',
  'olvido',
  'invierno',
  'laberinto',
  'faro',
  'desierto',
  'incendio',
  'tiempo',
  'secreto',
  'camino',
  'umbral',
  'océano',
  'naufragio',
  'guardián',
  'heredero',
  'testigo',
  'refugio',
  'abismo',
  'eco',
  'vértigo',
  'azar',
  'destierro',
  'regreso',
  'principio',
  'hilo',
  'sueño',
  'canto',
  'retrato',
  'cuaderno',
  'reloj',
  'mapa',
  'puente',
  'jinete',
  'relámpago',
  'susurro',
  'naranjo',
  'muro',
  'legado',
  'engaño',
]

const adjetivos = [
  'perdido',
  'invisible',
  'eterno',
  'oculto',
  'lejano',
  'roto',
  'silencioso',
  'prohibido',
  'imposible',
  'último',
  'olvidado',
  'infinito',
  'oscuro',
  'luminoso',
  'salvaje',
  'errante',
  'ausente',
  'amargo',
  'sereno',
  'extraño',
  'antiguo',
  'breve',
  'inmóvil',
  'incierto',
  'clandestino',
  'inacabado',
]

export const esLibros: LocaleDefinition = {
  metadata: {
    title: 'Español (libros)',
    code: 'es-libros',
    language: 'es',
    endonym: 'Español',
    dir: 'ltr',
    script: 'Latn',
  },

  word: {
    noun: sustantivos,
    adjective: adjetivos,
  },

  book: {
    genre: [
      'Novela',
      'Novela histórica',
      'Novela negra',
      'Ensayo',
      'Poesía',
      'Teatro',
      'Cuento',
      'Ciencia ficción',
      'Fantasía',
      'Terror',
      'Biografía',
      'Crónica',
      'Divulgación científica',
      'Filosofía',
      'Historia',
      'Infantil',
      'Juvenil',
      'Literatura clásica',
      'Misterio',
      'Aventuras',
      'Romántica',
      'Autoayuda',
      'Viajes',
      'Arte',
    ],

    // Templates: resolved with faker.helpers.fake() in the factory.
    title: [
      'El {{word.noun}} de {{location.city}}',
      'El {{word.noun}} {{word.adjective}}',
      'Crónica del {{word.noun}}',
      'Memorias del {{word.noun}} {{word.adjective}}',
      'Diario de un {{word.noun}}',
      'La casa del {{word.noun}}',
      'Cartas desde {{location.city}}',
      'El {{word.noun}} de {{person.lastName}}',
      'Historia del {{word.noun}} {{word.adjective}}',
      'Bajo el {{word.noun}} {{word.adjective}}',
      'Antes del {{word.noun}}',
      'Un {{word.noun}} en {{location.city}}',
      'El último {{word.noun}}',
      '{{word.noun}} y {{word.noun}}',
      'El retorno del {{word.noun}}',
    ],

    publisher: [
      'Editorial {{person.lastName}}',
      'Ediciones {{location.city}}',
      'Ediciones del {{word.noun}}',
      'Libros del {{word.noun}}',
      'Editorial {{person.lastName}} y {{person.lastName}}',
    ],
  },
}

/** Synopsis templates, also resolved with faker.helpers.fake(). */
export const descriptionTemplates = [
  'Una novela ambientada en {{location.city}} que explora el {{word.noun}} a través de tres generaciones.',
  'Un relato {{word.adjective}} sobre el {{word.noun}} y la memoria de una familia.',
  'Tras el {{word.noun}} de su padre, el protagonista regresa a {{location.city}} en busca de respuestas.',
  'Un ensayo {{word.adjective}} sobre el {{word.noun}} en la sociedad contemporánea.',
  'La historia de un {{word.noun}} {{word.adjective}} que cambió la vida de todo un pueblo.',
  'Crónica de un viaje por {{location.city}} donde el {{word.noun}} acaba siendo el verdadero protagonista.',
  'El autor reconstruye el {{word.noun}} de {{location.city}} con un estilo {{word.adjective}} y preciso.',
  'Dos desconocidos comparten un {{word.noun}} {{word.adjective}} en un tren rumbo a {{location.city}}.',
]
