import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'

/** Where the returned slice sits inside the full result set. */
export class PaginationMetaDto {
  /** The page that was returned. @example 2 */
  page: number

  /** Items per page that was asked for. @example 10 */
  limit: number

  /** Rows matching the query, across every page. @example 137 */
  total: number

  /** Pages the result set spans; `0` when it is empty. @example 14 */
  totalPages: number

  /** @example true */
  hasPreviousPage: boolean

  /** @example true */
  hasNextPage: boolean
}

/**
 * The envelope every list endpoint answers with.
 *
 * `data` is hidden here and re-declared per resource by
 * `@ApiPaginatedResponse()`: OpenAPI has no generics, so the element type can
 * only be pinned down at the endpoint. Left visible, the Swagger plugin would
 * also emit an untyped `data` that contradicts the one the decorator adds.
 */
export class PaginatedDto<T> {
  @ApiHideProperty()
  data: T[]

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto
}
