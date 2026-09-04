import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { UserRole } from '../../user/entities/index.js'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js'
import { ROLES_KEY } from '../decorators/roles.decorator.js'
import { AuthenticatedUser } from '../types/jwt-payload.js'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()]

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets))
      return true

    const roles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      targets,
    )
    if (!roles?.length) return true

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>()

    if (!user || !roles.includes(user.role))
      throw new ForbiddenException('Insufficient role')

    return true
  }
}
