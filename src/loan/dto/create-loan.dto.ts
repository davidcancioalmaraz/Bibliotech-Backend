import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Matches,
  Min,
} from 'class-validator'

import { LOAN_TERM_DAYS } from '../utils/dates.js'

export class CreateLoanDto {
  /** Book to lend. It must exist and be `available`. @example 1 */
  @IsInt()
  @Min(1)
  bookId: number

  /** Day the book leaves the shelf, as `YYYY-MM-DD`. Defaults to today. @example '2026-09-01' */
  @IsOptional()
  // Two checks, because neither is enough on its own: the pattern rejects the
  // full timestamps `parseDateOnly` would otherwise slice down in silence, and
  // `strict` rejects days that do not exist, like `2026-02-30`.
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'loanedAt must be a date in YYYY-MM-DD format',
  })
  @IsDateString({ strict: true })
  loanedAt?: string

  /** Loan term in days; `dueDate` is derived from it. Defaults to 14. @example 14 */
  @IsOptional()
  @IsIn([...LOAN_TERM_DAYS])
  termDays?: number
}
