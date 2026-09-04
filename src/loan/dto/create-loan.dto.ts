import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator'

import { LOAN_TERM_DAYS } from '../utils/dates.js'

export class CreateLoanDto {
  /** Book to lend. It must exist and be `available`. @example 1 */
  @IsInt()
  @Min(1)
  bookId: number

  /** Day the book leaves the shelf. Defaults to today. @example '2026-09-01' */
  @IsOptional()
  @IsDateString()
  loanedAt?: string

  /** Loan term in days; `dueDate` is derived from it. Defaults to 14. @example 14 */
  @IsOptional()
  @IsIn([...LOAN_TERM_DAYS])
  termDays?: number
}
