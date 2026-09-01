import { UserRole } from '../../user/entities/index.js'

export interface JwtPayload {
  sub: number
  email: string
  role: UserRole
}

export interface AuthenticatedUser {
  id: number
  name: string
  email: string
  role: UserRole
}
