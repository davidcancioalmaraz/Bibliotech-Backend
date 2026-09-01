import { OmitType } from '@nestjs/swagger'

import { Book } from '../entities/index.js'

/**
 * The book as the API returns it. `loans` is dropped: the relation is not
 * eager, so it never travels in a response and documenting it would promise a
 * field the endpoints do not send.
 */
export class BookResponseDto extends OmitType(Book, ['loans'] as const) {}
