import { UserRole } from '../entities/index.ts'

export class CreateUserDto {
  name: string
  email: string
  password: string
  role?: UserRole
  isActive?: boolean
}
