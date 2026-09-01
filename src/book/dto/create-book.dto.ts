import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

import { BookStatus } from '../entities/index.js'

export class CreateBookDto {
  /** @example 'Cien años de soledad' */
  @IsString()
  @IsNotEmpty()
  title: string

  /** @example 'Crónica de la estirpe de los Buendía en Macondo.' */
  @IsString()
  @IsNotEmpty()
  description: string

  /** Shelf code, unique across the catalogue. @example 'BT-4KQ7XZ21' */
  @IsString()
  @IsNotEmpty()
  code: string

  /** @example '978-0307474728' */
  @IsOptional()
  @IsString()
  isbn?: string

  /** @example 'Gabriel García Márquez' */
  @IsOptional()
  @IsString()
  author?: string

  /** @example 'Realismo mágico' */
  @IsOptional()
  @IsString()
  category?: string

  /** Publication year. @example 1967 */
  @IsOptional()
  @IsInt()
  @Min(1450)
  @Max(2100)
  year?: number

  /** @example 'Editorial Sudamericana' */
  @IsOptional()
  @IsString()
  publisher?: string

  /** ISO 639-1 code. Defaults to `es`. @example 'es' */
  @IsOptional()
  @IsString()
  language?: string

  /** @example 471 */
  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number

  /** Defaults to `available`. */
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus
}
