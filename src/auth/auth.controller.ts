import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { AuthService } from './auth.service.js'
import { CurrentUser } from './decorators/current-user.decorator.js'
import { Public } from './decorators/public.decorator.js'
import {
  AuthenticatedUserDto,
  LoginResponseDto,
} from './dto/auth-response.dto.js'
import { LoginDto } from './dto/login.dto.js'
import { JwtAuthGuard } from './guards/jwt-auth.guard.js'
import type { AuthenticatedUser } from './types/jwt-payload.js'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Exchanges credentials for a JWT. */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({
    description:
      'Bad credentials, unknown email and deactivated account all answer the same, so the API never reveals which emails exist',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  /** Returns the user behind the bearer token. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthenticatedUserDto })
  @ApiUnauthorizedResponse({ description: 'Missing, expired or invalid token' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user
  }
}
