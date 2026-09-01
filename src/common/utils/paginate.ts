import type { FindManyOptions, ObjectLiteral, Repository } from 'typeorm'

import { PaginatedDto } from '../dto/paginated.dto.js'
import { PaginationQueryDto } from '../dto/pagination-query.dto.js'

/**
 * Runs a `find` restricted to one page and wraps the rows in the envelope.
 *
 * `findAndCount` rather than a query builder, for two reasons the entities
 * already depend on: it honours eager relations — `Loan.book` is one, and a
 * query builder would silently drop it — and it honours `select: false`, which
 * is the only thing keeping `User.password` out of the responses.
 *
 * `options` should always carry an `order`: without an `ORDER BY`, Postgres
 * makes no promise about row order between queries, and under `LIMIT`/`OFFSET`
 * that means rows repeated or skipped as the caller pages through.
 */
export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  { page, limit }: PaginationQueryDto,
  options: FindManyOptions<T> = {},
): Promise<PaginatedDto<T>> {
  const [data, total] = await repository.findAndCount({
    ...options,
    skip: (page - 1) * limit,
    take: limit,
  })

  const totalPages = Math.ceil(total / limit)

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  }
}
