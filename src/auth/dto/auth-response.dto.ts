import { ApiProperty } from '@nestjs/swagger'

import { UserRole } from '../../user/entities/index.js'

/**
 * Public shape of the authenticated user. Mirrors the `AuthenticatedUser`
 * interface in `../types/jwt-payload.ts`, which cannot be documented on its
 * own: interfaces are erased at compile time and produce no schema.
 */
export class AuthenticatedUserDto {
  /** @example 1 */
  id: number

  /** @example 'Lucía Bermejo' */
  name: string

  /** @example 'admin@bibliotech.test' */
  email: string

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role: UserRole
}

export class LoginResponseDto {
  /** Signed JWT, sent back as `Authorization: Bearer <token>`. */
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string

  user: AuthenticatedUserDto
}
