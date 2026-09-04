import { ApiProperty, OmitType } from '@nestjs/swagger'

import { BookResponseDto } from '../../book/dto/book-response.dto.js'
import { Loan } from '../entities/index.js'

/**
 * The loan as the API returns it.
 *
 * The three `date` columns are re-declared because the Postgres driver hands
 * them over as plain `YYYY-MM-DD` strings, while the entity types them as
 * `Date` — which the CLI plugin would document as a full `date-time`.
 */
export class LoanResponseDto extends OmitType(Loan, [
  'book',
  'loanedAt',
  'dueDate',
  'returnedAt',
] as const) {
  @ApiProperty({ format: 'date', example: '2026-09-01' })
  loanedAt: string

  @ApiProperty({ format: 'date', example: '2026-09-22' })
  dueDate: string

  /** `null` while the copy is still out. */
  @ApiProperty({ format: 'date', example: null, nullable: true, type: String })
  returnedAt: string | null

  /** The lent copy; it travels with the loan, since the relation is eager. */
  @ApiProperty({ type: BookResponseDto })
  book: BookResponseDto
}
