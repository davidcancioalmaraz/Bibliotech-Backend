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
