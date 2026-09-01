import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  /** @example 'admin@bibliotech.test' */
  @IsEmail()
  email: string

  /** @example 'Bibliotech123' */
  @IsString()
  @IsNotEmpty()
  password: string
}
