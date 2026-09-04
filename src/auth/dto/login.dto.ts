import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  /** @example 'admin@bibliotech.test' */
  // Addresses are stored lowercased, and the lookup compares them exactly.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string

  /** @example 'Bibliotech123' */
  @IsString()
  @IsNotEmpty()
  password: string
}
