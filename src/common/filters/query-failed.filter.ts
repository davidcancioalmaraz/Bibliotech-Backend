import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  HttpException,
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import type { DatabaseError } from 'pg'
import { QueryFailedError } from 'typeorm'

/** Postgres SQLSTATE codes that describe a bad request rather than a bug. */
const UNIQUE_VIOLATION = '23505'
const FOREIGN_KEY_VIOLATION = '23503'
const NOT_NULL_VIOLATION = '23502'

/** `Key (email)=(a@b.test) already exists.` — the shape of every key `detail`. */
const KEY_DETAIL = /^Key \(([^)]+)\)=\(([^)]*)\)/

/** Deleting a row another table still points at. */
const REFERENCED_BY = /still referenced from table "([^"]+)"/

/** Inserting a row that points at a parent that is not there. */
const NOT_PRESENT_IN = /is not present in table "([^"]+)"/

/**
 * `users` → `User`. Every table in this schema is the plural of its entity, so
 * dropping the `s` is enough to name the resource in a message.
 */
const singular = (table = 'record') => {
  const name = table.replace(/s$/, '')
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const label = (table: string | undefined, value: string | undefined) =>
  value ? `${singular(table)} ${value}` : singular(table)

const parseKey = (detail: string | undefined) => {
  const match = detail?.match(KEY_DETAIL)
  return match ? { columns: match[1], value: match[2] } : null
}

/**
 * Turns a constraint violation into the answer it deserves, or `null` when the
 * failure is not something the caller could have avoided.
 *
 * Exported on its own so the mapping can be exercised without booting an app.
 */
export const toHttpException = (
  error: QueryFailedError,
): HttpException | null => {
  const driverError = error.driverError as DatabaseError | undefined
  if (!driverError) return null

  const key = parseKey(driverError.detail)

  switch (driverError.code) {
    case UNIQUE_VIOLATION:
      return new ConflictException(
        key
          ? `${singular(driverError.table)} with ${key.columns} '${key.value}' already exists`
          : `${singular(driverError.table)} already exists`,
      )

    case FOREIGN_KEY_VIOLATION: {
      const referencedBy = driverError.detail?.match(REFERENCED_BY)?.[1]
      if (referencedBy)
        return new ConflictException(
          `${label(driverError.table, key?.value)} is still referenced by ${referencedBy}`,
        )

      const missingIn = driverError.detail?.match(NOT_PRESENT_IN)?.[1]
      return new BadRequestException(
        missingIn
          ? `${label(missingIn, key?.value)} does not exist`
          : 'A referenced record does not exist',
      )
    }

    case NOT_NULL_VIOLATION:
      return new BadRequestException(
        `${driverError.column ?? 'A required field'} must not be null`,
      )

    default:
      return null
  }
}

/**
 * Last line of defence for the database constraints. The services check the
 * rules a caller can reasonably hit — a duplicate email, a book that still has
 * loans — and phrase the answer precisely; this filter catches what slips past
 * them: two simultaneous requests that both pass the same pre-check, or a
 * constraint added later that nobody remembered to guard.
 *
 * Without it those land as a raw `QueryFailedError` and Nest answers 500.
 */
@Catch(QueryFailedError)
export class QueryFailedFilter extends BaseExceptionFilter {
  override catch(exception: QueryFailedError, host: ArgumentsHost) {
    // An unmapped failure is handed back untouched: it really is a bug, and it
    // should keep answering 500 and reaching the logs with its stack.
    super.catch(toHttpException(exception) ?? exception, host)
  }
}
