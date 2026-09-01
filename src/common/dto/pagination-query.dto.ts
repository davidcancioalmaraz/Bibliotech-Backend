import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

/**
 * Query parameters every list endpoint accepts.
 *
 * The defaults live in the property initialisers: `class-transformer` leaves a
 * key the query string did not carry untouched, so an omitted `page` keeps the
 * `1` written here — and the Swagger plugin reads the same initialiser to
 * document the default.
 */
export class PaginationQueryDto {
  /** Page to return, starting at 1. @example 1 */
  @ApiPropertyOptional()
  @IsOptional()
  // The global `ValidationPipe` transforms but does not convert implicitly, so
  // a query param — always a string — needs the cast spelled out.
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = DEFAULT_PAGE

  /** Items per page, at most 100. @example 20 */
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = DEFAULT_PAGE_SIZE
}
