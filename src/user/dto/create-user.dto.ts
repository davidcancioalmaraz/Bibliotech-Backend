import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

import { UserRole } from '../entities/index.js'

export class CreateUserDto {
  /** @example 'Lucía Bermejo' */
  @IsString()
  @IsNotEmpty()
  name: string

  /** @example 'admin@bibliotech.test' */
  // The unique index on `users.email` is case-sensitive, so without this
  // `Admin@…` and `admin@…` would both be insertable as separate accounts.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string

  /** Stored as a bcrypt hash; never returned by the API. @example 'Bibliotech123' */
  @IsString()
  @MinLength(8)
  password: string

  /** Defaults to `member`. */
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  /** Defaults to `true`. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
