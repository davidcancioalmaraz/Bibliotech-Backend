import { setSeederFactory } from 'typeorm-extension'

import { Loan } from '../../loan/entities/loan.entity.js'
import { LOAN_TERM_DAYS, addDays, today } from '../../loan/utils/dates.js'
import { faker } from './faker.js'

/**
 * Dates a closed loan, returned before `before`. Chaining calls with
 * `before = loan.loanedAt` builds a history backwards without overlaps, which
 * is how a real copy behaves: it can only be in one person's hands at a time.
 */
export const dateAsReturned = (loan: Loan, before: Date) => {
  const term = faker.helpers.arrayElement(LOAN_TERM_DAYS)
  // Days the copy sits on the shelf before the next loan.
  const returnedAt = addDays(before, -faker.number.int({ min: 1, max: 30 }))
  const loanedAt = addDays(
    returnedAt,
    -faker.number.int({ min: 1, max: term + 7 }),
  )

  loan.loanedAt = loanedAt
  loan.dueDate = addDays(loanedAt, term)
  loan.returnedAt = returnedAt

  return loan
}

/** Dates an open loan; some come out overdue on purpose. */
export const dateAsOpen = (loan: Loan) => {
  const term = faker.helpers.arrayElement(LOAN_TERM_DAYS)
  const loanedAt = addDays(
    today(),
    -faker.number.int({ min: 0, max: term + 10 }),
  )

  loan.loanedAt = loanedAt
  loan.dueDate = addDays(loanedAt, term)
  loan.returnedAt = null

  return loan
}

/**
 * Generates an already returned loan, the majority case in the history.
 * `LoanSeeder` reorders the dates per copy and reopens the ones still live, so
 * the loans agree with each book's `status`.
 */
export const loanFactory = setSeederFactory(Loan, () => {
  const loan = new Loan()

  loan.code = `LN-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`

  return dateAsReturned(loan, today())
})
