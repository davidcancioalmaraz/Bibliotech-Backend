import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { UserService } from '../user/user.service.js'
import { comparePassword } from '../user/utils/password.ts'
import { User } from '../user/entities/index.js'
import { LoginDto } from './dto/login.dto.js'
import { AuthenticatedUser, JwtPayload } from './types/jwt-payload.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const invalid = new UnauthorizedException('Invalid credentials')

    const user = await this.userService.findByEmailWithPassword(email)
    if (!user || !user.isActive) throw invalid

    if (!(await comparePassword(password, user.password))) throw invalid

    return user
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password)

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.toAuthenticatedUser(user),
    }
  }

  toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }
}
