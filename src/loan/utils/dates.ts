/** Loan terms the library offers, in days. */
export const LOAN_TERM_DAYS = [14, 21, 30] as const

/** Default term applied when the request does not pick one. */
export const DEFAULT_LOAN_TERM_DAYS = 14

/** Drops the time: `date` columns only store year, month and day. */
export const dateOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const today = () => dateOnly(new Date())

/**
 * Parses the `YYYY-MM-DD` head of an ISO string into a *local* date. Going
 * through `new Date(value)` would land on UTC midnight and shift a day back
 * in western timezones.
 */
export const parseDateOnly = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Normalises what comes back from a `date` column: the Postgres driver hands
 * those over as `YYYY-MM-DD` strings, even though the entity types them as
 * `Date`.
 */
export const toDateOnly = (value: Date | string) =>
  typeof value === 'string' ? parseDateOnly(value) : dateOnly(value)
